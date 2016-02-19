<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Integrations extends CI_Model {

	public function getIntegrationVendors($userId)
	{
		$joinClause = ( $userId ) ? " AND userId = $userId OR userId IS NULL" : '';

		$this->db->select('*');
		$this->db->from('integrationVendors');
		$this->db->join('integrations', 'integrations.integrationVendorId = integrationVendors.integrationVendorId'.$joinClause, 'left');

		
		$this->db->where('integrationVendors.active', 1);

		$query = $this->db->get();

		return $query->result();
	}

	public function getIntegration($integrationId)
	{
		$this->db->select('*');
		$this->db->from('integrations');
		$this->db->join('integrationVendors', 'integrations.integrationVendorId = integrationVendors.integrationVendorId', 'right');
		$this->db->where('integrationId', $integrationId);

		$query = $this->db->get();

		return $query->result();
	}

	public function getVendorByVendorReferenceName($vendorReferenceName)
	{
		$this->db->select('*');
		$this->db->from('integrationVendors');
		$this->db->where('vendorReferenceName', $vendorReferenceName);
		$this->db->where('active', 1);

		$query = $this->db->get();

		return $query->result();
	}
    
	public function connectVendor( $userId, $integrationVendorId, $apiKey, $username, $password, $token )
	{
		$this->db->set('userId',              $userId);
		$this->db->set('integrationVendorId', $integrationVendorId);
		$this->db->set('apiKey',              $apiKey);
		$this->db->set('username',            $username);
		$this->db->set('password',            $password);
		$this->db->set('token',               $token);

		$this->db->insert('integrations');

		return $this->db->insert_id();
	}
    
	public function updateIntegration( $integrationId, $updateFields )
	{
		$this->db->where('integrationId', $integrationId);
		$this->db->update('integrations', $updateFields); 
	}
    
	public function deleteIntegration( $integrationId )
	{
		$this->db->start_cache();
		$this->db->where('integrationId', $integrationId);
		$this->db->delete('integrations');
		$this->db->limit(1);
		$this->db->stop_cache();
		$this->db->flush_cache();

		$this->db->where('integrationId', $integrationId);
		$updateFields = array('integrationId' => null,'segmentid'=>'');
		$this->db->update('quizzes', $updateFields); 
	}
}

/* End of file integrations.php */
/* Location: ./application/models/integrations.php */