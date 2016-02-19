<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class Vendor extends CI_Model {

    abstract public function validateCredentials( $apiKey, $username, $password, $token );

    abstract public function getIntegrationSegments( $integrationId );

    abstract public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token );

    public function getIntegration( $integrationId ) {
		$this->db->select('*');
		$this->db->from('integrations');
		$this->db->join('integrationVendors','integrations.integrationVendorId=integrationVendors.integrationVendorId');
		$this->db->where('integrationId', $integrationId);
		$this->db->limit(1);

		$query = $this->db->get();

		return $query->result();
    }

    public function curlCall( $url, $parameters, $additionalHeaders = false ) {

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($parameters));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        if( $additionalHeaders ) {
	        foreach( $additionalHeaders as $header ) {
	        	curl_setopt($curl, $header['header'], $header['value']);
	        }
        }

        $result = curl_exec( $curl );

        return json_decode( $result );
    }

}
