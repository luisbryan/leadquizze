<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("getresponse/jsonRPCClient.php");

class getresponse extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $client = new jsonRPCClient( 'http://api2.getresponse.com' );

        $account = $client->get_account_info( $apiKey );
        
        return $account ? true : false;
	}

    public function getIntegrationSegments( $integrationId ) {
        $lists = array();
        $segments = array();

        $integration = $this->getIntegration( $integrationId );

        $client = new jsonRPCClient( 'http://api2.getresponse.com' );

        $campaigns = $client->get_campaigns( $integration[0]->apiKey );

        foreach( $campaigns as $id => $campaign ) {
            $segments[] = array(
                'id'            => (String) $id,
                'integrationId' => $integrationId,
                'name'          => $campaign['name'] );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $client = new jsonRPCClient( 'http://api2.getresponse.com' );

        $parameters = array(
            'campaign'  => $campaignId,
            'name'      => "$firstName $lastName",
            'email'     => $email
        );

        $result = $client->add_contact( $apiKey, $parameters );

        return true;
    }
}
