<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("maropost/mp-class.php");

class maropost extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $mp = new MP;
        $mp->setIntegrationCred( $apiKey, $username );

        $result = $mp->request('GET','relational_tables', array());

        return ( isset( $result ) ) ? true : false;
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $lists = array();
        $segments = array();

        $mp = new MP;
        $mp->setIntegrationCred( $integration[0]->apiKey, $integration[0]->username );

        $lists = $mp->request('GET','lists', array());

        foreach( $lists as $list ) {
            $segments[] = array(
                'id'            => (String) $list->id,
                'integrationId' => $integrationId,
                'name'          => $list->name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $mp = new MP;
        $mp->setIntegrationCred( $apiKey, $username );

        $result = $mp->request('POST','lists/' . $campaignId . '/contacts', array(
            'email'      => $email,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'phone'      => $phone
            // 'custom_field' => array('quiz_result'=>$result)
        ));
    }
}
