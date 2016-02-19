<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends REST_Controller {
	
	public function getUsers()
	{
		$output['users'] = $this->Users->getUsers();
		$output['status'] = true;
		echo json_encode( $output );
	}

	public function login()
	{
		$this->form_validation->set_rules('email', 'email', 'required|max_length[256]');
		$this->form_validation->set_rules('password', 'password', 'required|min_length[6]|max_length[256]');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$email = $this->input->post('email');
			$password = $this->input->post('password');

			$user = $this->Users->login($email, $password);

			if ($user && $user->id != false) {
				$token = array();
				$token['id']        = $user->id;
				$output['status']   = true;
				$output['id']       = $user->id;
				$output['roleId']   = $user->roleId;
				$output['statusId'] = $user->statusId;
				$output['userLogo'] = $user->userLogo;
				$output['website']  = $user->website;
				$output['name']     = $user->name;
				$output['email']    = $user->email;
				$output['token']    = JWT::encode($token, $this->config->item('jwt_key'));
			}
			else
			{
				$output['errors'] = '{"type": "invalid"}';
			}
			return $output;
		});
	}

	public function register()
	{
		$this->form_validation->set_rules('companyName', 'company name', 'required');
		$this->form_validation->set_rules('name', 'name', 'required');
		$this->form_validation->set_rules('email', 'email', 'required|valid_email|is_unique[users.email]|max_length[256]');
		$this->form_validation->set_rules('phone', 'phone', 'required');
		$this->form_validation->set_rules('website', 'website', 'required');
		$this->form_validation->set_rules('password', 'password', 'required|min_length[6]|max_length[256]');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$email = $this->input->post('email');
			$password = $this->input->post('password');
			$companyName = $this->input->post('companyName');
			$name = $this->input->post('name');
			$phone = $this->input->post('phone');
			$website = $this->input->post('website');

			$this->Users->register($email, $companyName, $name, $phone, $website, $password);
			$output['status'] = true;
			return $output;
		});
	}

	public function registerAdmin()
	{
		$this->form_validation->set_rules('username', 'username', 'required|is_unique[users.email]|max_length[256]');
		$this->form_validation->set_rules('password', 'password', 'required|min_length[6]|max_length[256]');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$username = $this->input->post('username');
			$password = $this->input->post('password');
			$companyName = $this->input->post('companyName');
			$name = $this->input->post('name');
			$phone = $this->input->post('phone');
			$website = $this->input->post('website');

			$this->Users->register($username, 'Yazamo', 'Admin', '4805122428', 'http://www.leadquizzes.com', $password, 1);
			$output['status'] = true;
			return $output;
		});
	}

	public function updateUserInfo()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		$this->form_validation->set_rules('name', 'name', 'required');
		$this->form_validation->set_rules('email', 'email', 'required|valid_email');
		$this->form_validation->set_rules('website', 'website', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId  = $this->input->post('userId');
			$name    = $this->input->post('name');
			$email   = $this->input->post('email');
			$website = $this->input->post('website');

			$this->Users->updateUserInfo( $userId, $name, $email, $website );

			$output['status'] = true;

			return $output;
		});
	}

	public function updatePassword()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		$this->form_validation->set_rules('oldpass', 'old password', 'required');
		$this->form_validation->set_rules('newpass', 'new password', 'required|min_length[6]|matches[newpass2]');
		$this->form_validation->set_rules('newpass2', 'confirm new password', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId   = $this->input->post('userId');
			$oldpass  = $this->input->post('oldpass');
			$newpass  = $this->input->post('newpass');
			$newpass2 = $this->input->post('newpass2');

			$output['status'] = $this->Users->updatePassword( $userId, $oldpass, $newpass );

			return $output;
		});
	}

	public function forgot() {
		require "integration/mandrill/src/Mandrill.php";

        $recoverLink = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);

        $recoverId = $this->Users->insertRecoveryLink( $recoverLink, $this->input->post('email') );

		if ($recoverId)
		{
		    try {
		        $mandrill = new Mandrill('nNn5TRkBJIEKxy6rTWqzBQ');
		        $message = array(
		            'text' => 'In order to reset your LeadQuizzes password, please follow this link: https://quiz.leadquizzes.com/recover/' . $recoverLink . '

Please note that this link will only be valid for a period of 10 minutes. If you did not request this email, you can simply ignore it.

Yazamo Support
support@yazamo.com',
		            'subject'    => 'Reset your LeadQuizzes Password',
		            'from_email' => 'Support@yazamo.com',
		            'from_name'  => 'Yazamo Support',
		            'to' => array(
		                array(
		                    'email' => $this->input->post('email'),
		                    'name'  => $this->input->post('email'),
		                    'type'  => 'to'
		                )
		            ),
		            'headers' => array( 'Reply-To' => 'Support@yazamo.com' ) );

		        $async = false;
		        $ip_pool = 'Main Pool';
		        $send_at = 'example send_at';
		        $result = $mandrill->messages->send( $message, $async );

		        if( $result[0]['status'] == 'sent' ) {
		            echo 'success';
		        } else {
		            echo 'fail';
		        }
		    } catch( Mandrill_Error $e ) {
		        // Mandrill errors are thrown as exceptions
		        echo 'An email error occurred: ' . get_class($e) . ' - ' . $e->getMessage();
		        // A mandrill error occurred: Mandrill_Unknown_Subaccount - No subaccount exists with the id 'customer-123'
		        throw $e;
		    }

			echo json_encode( array( 'status' => ( $result[0]['status'] == 'sent' ) ? true : false ) );
		}
		else
		{
			echo json_encode( array( 'status' => false ) );
		}
	}

	public function resetPassword()
	{
		$this->form_validation->set_rules('recoverLink', 'recovery link', 'required');
		$this->form_validation->set_rules('newpass', 'new password', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$recoverLink = $this->input->post('recoverLink');
			$newpass = $this->input->post('newpass');

			$output['status'] = $this->Users->resetPassword( $recoverLink, $newpass );

			return $output;
		});
	}

	public function uploadUserLogo() {
		//set the path where the files uploaded will be copied. NOTE if using linux, set the folder to permission 777
		$config['upload_path'] = '../images/uploads/logos/';
		
    	// set the filter image types
		$config['allowed_types'] = 'gif|jpg|png';
		
		//load the upload library
		$this->load->library('upload', $config);
    
	    $this->upload->initialize($config);
	    
	    $this->upload->set_allowed_types('*');

		$output['upload_data'] = '';
    
		//if not successful, set the error message
		if (!$this->upload->do_upload('file')) {
			$output['error'] = $this->upload->display_errors();
		} else { //else, set the success message
			$output['status'] = true;
      
      		$upload_data = $this->upload->data();

			$imageId = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

			rename( $config['upload_path'] . $upload_data['file_name'], $config['upload_path'] . $imageId . $upload_data['file_ext'] );

			$output['userLogo'] = $imageId . $upload_data['file_ext'];
		}

		echo json_encode( $output );
	}

	public function updateUserLogo()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		$this->form_validation->set_rules('userLogo', 'user logo', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId = $this->input->post('userId');
			$userLogo = $this->input->post('userLogo');

			$this->Users->updateUserLogo( $userId, $userLogo );

			$output['status'] = true;
			$output['userLogo'] = $userLogo;

			return $output;
		});
	}

	public function setUserStatus()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		$this->form_validation->set_rules('status', 'status', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId = $this->input->post('userId');
			$status = $this->input->post('status');

			$this->Users->setUserStatus( $userId, $status );

			$output['status'] = true;

			return $output;
		});
	}

	public function permissions()
	{
		$this->form_validation->set_rules('resource', 'resource', 'required');
		return Validation::validate($this, 'user', 'read', function($token, $output)
		{
			$userId = $this->input->post('userId');
			$resource = $this->input->post('resource');
			$acl = new ACL();
			$permissions = $acl->userPermissions($userId, $resource);
			$output['status'] = true;
			$output['resource'] = $resource;
			$output['permissions'] = $permissions;
			return $output;
		});
	}

}

/* End of file user.php */
/* Location: ./application/controllers/user.php */