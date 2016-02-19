<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Integration extends REST_Controller {
	
	public function getIntegrationVendors()
	{
		$userId = $this->input->post('userId');

		$vendors = $this->Integrations->getIntegrationVendors($userId);
		
		$output['status'] = true;
		$output['vendors'] = $vendors;

		echo json_encode( $output );
	}

	public function getIntegration()
	{
		$this->form_validation->set_rules('integrationId', 'integration Id', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$integrationId = $this->input->post('integrationId');

			$integration = $this->Integrations->getIntegration($integrationId);
			
			$output['status'] = true;
			$output['integration'] = $integration;

			return $output;
		});
	}

	public function getIntegrationSegments()
	{
		$this->form_validation->set_rules('integrationId', 'integration Id', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$integrationId = $this->input->post('integrationId');
			$integration = $this->Integrations->getIntegration($integrationId);
			$vendorReferenceName = $integration[0]->vendorReferenceName;

			require_once("integration/$vendorReferenceName.php");
			$vendor = new $vendorReferenceName();
			$integrationSegments = $vendor->getIntegrationSegments( $integrationId );
			
			$output['status'] = true;
			$output['segments'] = $integrationSegments;

			return $output;
		});
	}

	public function getVendorByVendorReferenceName()
	{
		$this->form_validation->set_rules('vendorReferenceName', 'vendor reference name', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$vendorReferenceName = $this->input->post('vendorReferenceName');

			$vendor = $this->Integrations->getVendorByVendorReferenceName($vendorReferenceName);
			
			$output['status'] = true;
			$output['vendor'] = $vendor;

			return $output;
		});
	}

	public function getAuthorizationUrl()
	{
		$this->form_validation->set_rules('userId', 'user Id', 'required');
		$this->form_validation->set_rules('vendorReferenceName', 'vendor reference name', 'required');
		$this->form_validation->set_rules('oauthKey', 'Oauth API key', 'required');
		$this->form_validation->set_rules('oauthSecret', 'Oauth Secret Key', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId              = $this->input->post('userId');
			$vendorReferenceName = $this->input->post('vendorReferenceName');
			$oauthKey            = $this->input->post('oauthKey');
			$oauthSecret         = $this->input->post('oauthSecret');

			$output['url'] = $this->getAuthorizationUrlFromVendor($userId, $vendorReferenceName, $oauthKey, $oauthSecret);
			$output['status'] = true;

			return $output;
		});
	}
	
	public function connectVendor()
	{
		$this->form_validation->set_rules('userId', 'user Id', 'required');
		$this->form_validation->set_rules('vendorReferenceName', 'vendor reference name', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId              = $this->input->get_post('userId');
			$vendorReferenceName = $this->input->get_post('vendorReferenceName');
			$apiKey              = $this->input->get_post('apiKey');
			$username            = $this->input->get_post('username');
			$password            = $this->input->get_post('password');
			$token               = $this->input->get_post('token');

			$vendor = $this->Integrations->getVendorByVendorReferenceName($vendorReferenceName);

			if( $vendorReferenceName == 'aweber' ) { // aweber gets a special case because its garbage
				require_once("integration/aweber.php");
				$aweber = new aweber();

				$token = $aweber->getAccessToken( null, $apiKey, $vendor[0]->oauthKey, $vendor[0]->oauthSecret );

				$newIntegrationId = $this->Integrations->connectVendor( $userId, $vendor[0]->integrationVendorId, null, $token['username'], $token['password'], $token['token'] );

				$output['status'] = true;
				$output['integrationId'] = $newIntegrationId;
			} else {
				if( $returnCredentials = $this->validateCredentials( $vendorReferenceName, $apiKey, $username, $password, $token ) ) {
					$username = ( isset( $returnCredentials['username'] ) ) ? $returnCredentials['username'] : $username;
					$password = ( isset( $returnCredentials['password'] ) ) ? $returnCredentials['password'] : $password;
					$apiKey   = ( isset( $returnCredentials['apiKey'] ) )   ? $returnCredentials['apiKey']   : $apiKey;
					$token    = ( isset( $returnCredentials['token'] ) )    ? $returnCredentials['token']    : $token;

					$newIntegrationId = $this->Integrations->connectVendor( $userId, $vendor[0]->integrationVendorId, $apiKey, $username, $password, $token );

					$output['status'] = true;
					$output['integrationId'] = $newIntegrationId;
				}

				return $output;
			}

		});
	}

	public function cc_endpoint()
	{
		require_once("integration/constant_contact.php");
		$cc = new constant_contact();

		$vendor   = $this->Integrations->getVendorByVendorReferenceName('constant_contact');
		$userId   = $this->input->get_post('userId');
		$username = $this->input->get_post('username');
		$token    = $cc->getAccessToken( $userId, $this->input->get_post('code'), $vendor[0]->oauthKey, $vendor[0]->oauthSecret );

		if( $this->Integrations->connectVendor( $userId, $vendor[0]->integrationVendorId, null, $username, null, $token['token'] ) ) {
			echo "Your Constant Contact account has been connected. You can close this window and return to LeadQuizzes";
		} else {
			echo "An error occurred while attempting to connect your Constant Contact account";
		}
	}

	public function updateIntegration()
	{
		$this->form_validation->set_rules('integrationId', 'integration Id', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$integrationId = $this->input->post('integrationId');
			$updateFields = array();

			if( $this->input->post('username') != null ) {
				$updateFields['username'] = $this->input->post('username');
			}
			if( $this->input->post('apiKey') != null ) {
				$updateFields['apiKey'] = $this->input->post('apiKey');
			}
			if( $this->input->post('password') != null ) {
				$updateFields['password'] = $this->input->post('password');
			}
			if( $this->input->post('token') != null ) {
				$updateFields['token'] = $this->input->post('token');
			}

			$this->Integrations->updateIntegration( $integrationId, $updateFields );

			$output['status'] = true;
			$output['integrationId'] = $integrationId;

			return $output;
		});
	}

	public function deleteIntegration()
	{
		$this->form_validation->set_rules('integrationId', 'integration Id', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$integrationId = $this->input->post('integrationId');

			$this->Integrations->deleteIntegration( $integrationId );

			$output['status'] = true;

			return $output;
		});
	}

	public function saveContact()
	{
		$this->form_validation->set_rules('integrationId', 'integration Id', 'required');
		$this->form_validation->set_rules('segmentid', 'segment Id', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$integrationId = $this->input->post('integrationId');
			$segmentid     = $this->input->post('segmentid');

			$firstName = $this->input->post('firstName');
			$lastName  = $this->input->post('lastName');
			$email     = $this->input->post('email');
			$phone     = $this->input->post('phone');
			$result    = $this->input->post('result');

			$integration = $this->Integrations->getIntegration($integrationId);

			$apiKey   = $integration[0]->apiKey;
			$username = $integration[0]->username;
			$password = $integration[0]->password;
			$token    = $integration[0]->token;
			$vendorReferenceName = $integration[0]->vendorReferenceName;

			// special exceptions
			if( $vendorReferenceName == 'constant_contact' ) {
				$apiKey = $integration[0]->oauthKey;
			}
			if( $vendorReferenceName == 'aweber' ) {
				$apiKey = $integration[0]->oauthKey;
				$username = $integration[0]->oauthSecret;
			}

			require_once("integration/$vendorReferenceName.php");
			$vendor = new $vendorReferenceName();
			$integrationSegments = $vendor->saveContact( $segmentid, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token );

			$output['status'] = true;

			return $output;
		});
	}

	private function validateCredentials( $vendorReferenceName, $apiKey, $username, $password, $token ) {
		require_once("integration/$vendorReferenceName.php");

		$vendor = new $vendorReferenceName();

        return $vendor->validateCredentials( $apiKey, $username, $password, $token );
	}

	private function getAuthorizationUrlFromVendor( $userId, $vendorReferenceName, $apiKey, $apiSecret ) {
		require_once("integration/$vendorReferenceName.php");

		$vendor = new $vendorReferenceName();

        return $vendor->getAuthorizationUrl( $userId, $vendorReferenceName, $apiKey, $apiSecret );
	}

}

/* End of file integration.php */
/* Location: ./application/controllers/integration.php */