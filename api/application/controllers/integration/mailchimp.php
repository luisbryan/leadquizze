<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("Infusionsoft/isdk.php");

class mailchimp extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {

        $parameters = array( 'apikey' => $apiKey );
        $urlPrefix = $this->getUrlPrefix( $apiKey );

        $result = $this->curlCall( 'https://' . $urlPrefix . '.api.mailchimp.com/2.0/users/profile', $parameters );

        if( isset( $result->status ) && $result->status == 'error' ) {
            return false;
        } else {
            return ( $result->username == $username ) ? true : false;
        }
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $parameters = array( 'apikey' => $integration[0]->apiKey );
        $urlPrefix = $this->getUrlPrefix( $integration[0]->apiKey );

        $lists = $this->curlCall( 'https://' . $urlPrefix . '.api.mailchimp.com/2.0/lists/list', $parameters );

        $segments = array();
        foreach( $lists->data as $list ) {
            $segments[] = array(
            'id'            => (String) $list->id,
            'integrationId' => $integrationId,
            'name'          => $list->name );
        }
        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $email_struct = new StdClass();
        $email_struct->email = trim($email);

        $merge_vars = new StdClass();
        $merge_vars->FNAME      = trim($firstName);
        $merge_vars->LNAME      = trim($lastName);
        $merge_vars->QUIZRESULT = trim($result);
        $merge_vars->PHONE      = trim($phone);

        $parameters = array(
            'apikey'       => $apiKey,
            'id'           => $campaignId,
            'email'        => $email_struct,
            'merge_vars'   => $merge_vars,
            'double_optin' => false,
            'send_welcome' => false
        );

        $urlPrefix = $this->getUrlPrefix( $apiKey );

        $result = $this->curlCall( 'https://' . $urlPrefix . '.api.mailchimp.com/2.0/lists/subscribe', $parameters );

        return ( isset( $result->euid ) ) ? true : false;
    }

    private function getUrlPrefix( $apiKey ) {
        $splitKey = explode( '-', $apiKey );
        return $splitKey[1];
    }
}
