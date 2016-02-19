<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Users extends CI_Model {

	public function getUsers()
	{
		$this->db->select('users.*, userStatuses.userStatusName, count(quizzes.quizId) as quizCount');
		$this->db->from('users');
		$this->db->join('userStatuses', 'users.statusId = userStatuses.userStatusId', 'left');
		$this->db->join('quizzes', 'quizzes.userId = users.id', 'left');
		$this->db->group_by('users.id');

		$query = $this->db->get();

		return $query->result();
	}

	public function login($email, $password)
	{
		$this->db->select('*');
		$this->db->from('users');
		$this->db->where('email', $email);
		$this->db->limit(1);
		$query = $this->db->get();
		if ($query->num_rows() == 1)
		{
			$result = $query->result();
			if (Password::validate_password($password, $result[0]->password))
			{
				return $result[0];
			}
			return false;
		}
		return false;
	}
    
	public function register($email, $companyName, $name, $phone, $website, $password, $roleId = 0)
	{
		$this->db->set('email',  $email);
		$this->db->set('companyName',  $companyName);
		$this->db->set('name',  $name);
		$this->db->set('phone',  $phone);
		$this->db->set('website',  $website);
		$this->db->set('password', Password::create_hash($password));
		$this->db->set('roleId',  $roleId);
		$this->db->insert('users');
		return $this->db->insert_id();
	}

	public function updatePassword( $userId, $oldpass, $newpass ) {
		$this->db->select('*');
		$this->db->from('users');
		$this->db->where('id', $userId);
		$this->db->limit(1);
		$query = $this->db->get();
		if ($query->num_rows() == 1)
		{
			$result = $query->result();
			if (Password::validate_password($oldpass, $result[0]->password))
			{
				$this->db->where('id', $userId);
				$this->db->update('users', array( 'password' => Password::create_hash($newpass) ) );
				return $result;
			}
			return false;
		}
		return false;
	}

	public function resetPassword( $recoverLink, $newpass ) {
		$this->db->select('*');
		$this->db->from('users');
		$this->db->join('pwdRecover', 'users.id = pwdRecover.userId', 'left');
		$this->db->where('recoverLink', $recoverLink);
		$this->db->limit(1);
		$query = $this->db->get();
		if ($query->num_rows() == 1)
		{
			$result = $query->result();

			$this->db->where('id', $result[0]->userId);
			$this->db->update('users', array( 'password' => Password::create_hash($newpass) ) );
			return $result;
		}
		return false;
	}
    
	public function insertRecoveryLink($recoverLink, $email)
	{
		$this->db->select('id');
		$this->db->from('users');
		$this->db->where('email', $email);
		$query = $this->db->get();

		if ($query->num_rows() == 1)
		{
			$user  = $query->result();

			$this->db->set('recoverLink',  $recoverLink);
			$this->db->set('userId',  $user[0]->id);
			$this->db->insert('pwdRecover');
			return $this->db->insert_id();
		}
		else
		{
			return false;
		}
	}

	public function updateUserInfo( $userId, $name, $email, $website ) {
		$this->db->where('id', $userId);
		$this->db->update('users', array( 'name' => $name, 'email' => $email, 'website' => $website ) ); 
	}

	public function updateUserLogo( $userId, $logo ) {
		$this->db->where('id', $userId);
		$this->db->update('users', array( 'userLogo' => $logo ) ); 
	}
    
	public function setUserStatus( $userId, $status )
	{
		$this->db->where('id', $userId);
		$this->db->update('users', array( 'statusId' => $status ) ); 
	}

	public function table($params)
	{
		$limit = intval($params->count);
		$offset = intval(($params->page - 1) * $params->count);
		$sorting = get_object_vars($params->sorting);
		$direction = reset($sorting);
		$key = key($sorting);
		if ($limit > 100) return;
		if ($limit < 0) return;
		if ($offset < 0) return;
		if (!in_array($direction, array('asc', 'desc'))) return;
		if (!in_array($key, array('id', 'email'))) return;
		$this->db->select('*');
		$this->db->from('users');
		$this->db->order_by($key, $direction);
		$this->db->limit($limit, $offset);
		$query = $this->db->get();
		if ($query->num_rows() >= 1)
		{
			$results = $query->result();
		}
		$users = array();
		foreach ($results as $result)
		{
			$user = new stdClass();
			$user->id = $result->id;
			$user->email = $result->email;
			$users[] = $user;
		}
		$total = $this->db->count_all('users');
        
		$data = array();
		$data['total'] = $total;
		$data['users'] = $users;
		return $data;
	}	

	public function read($id)
	{
		$user = new stdClass();

		$this->db->select('*');
		$this->db->from('users');
		$this->db->where('id', $id);
		$this->db->limit(1);

		$query = $this->db->get();
		if ($query->num_rows() == 1)
		{
			$result = $query->result();
			$user->id = $result[0]->id;
			$user->email = $result[0]->email;
			$acl = new ACL();
			$user->roles = $acl->userRoles($user->id);
		}

		return $user;
	}

	public function update($user)
	{
		$this->db->select('*');
		$this->db->from('users');
		$this->db->where('id', $user->id);
		$this->db->limit(1);

		$query = $this->db->get();
		if ($query->num_rows() == 1)
		{
			$acl = new ACL();
			$roles = $acl->userRoles($user->id);
			if ($user->roles != $roles)
			{
				$acl->removeUserRoles($user->id, $roles);
				$acl->addUserRoles($user->id, $user->roles);
			}
			$this->db->where('id', $user->id);
			$this->db->update('users', $user);             
            
			$user = $this->read($user->id);
		}

		return $user;
	}	

	public function delete($id)
	{
		$this->db->where('id', $id);
		$this->db->delete('users');
		$this->db->limit(1);
	}
    
}

/* End of file users.php */
/* Location: ./application/models/users.php */