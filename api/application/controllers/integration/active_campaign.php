<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("activecampaign/includes/ActiveCampaign.class.php");

class active_campaign extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $ac = new ActiveCampaign( $token, $apiKey );

        return $ac->credentials_test();
	}

    public function getIntegrationSegments( $integrationId ) {
        $lists = array();
        $segments = array();

        $integration = $this->getIntegration( $integrationId );

        $ac = new ActiveCampaign( $integration[0]->token, $integration[0]->apiKey );

        $lists = $ac->api("list/list", array('ids'=>'all'));
        
        foreach( $lists as $list ) {
            if( isset( $list->id ) ) {
                $segments[] = array(
                    'id'            => (String) $list->id,
                    'integrationId' => $integrationId,
                    'name'          => $list->name );
            }
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $ac = new ActiveCampaign( $token, $apiKey );

        $contact = array(
            "email"                 => $email,
            "first_name"            => $firstName,
            "last_name"             => $lastName,
            "p[{$campaignId}]"      => $campaignId,
            "phone"                 => $phone,
            "status[{$campaignId}]" => 1, // "Active" status
        );

        $contact_sync = $ac->api("contact/sync", $contact);

        return $contact_sync->success;
    }
}
