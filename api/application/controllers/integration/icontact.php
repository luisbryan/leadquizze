<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("icontact/iContactApi.php");

class icontact extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $oiContact = iContactApi::getInstance()->setConfig(array(
            'appId'       => $apiKey,
            'apiPassword' => $password,
            'apiUsername' => $username
        ));

        return $oiContact->setAccountId() ? true : false;
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $lists = array();
        $segments = array();

        $oiContact = iContactApi::getInstance()->setConfig(array(
            'appId'       => $integration[0]->apiKey,
            'apiPassword' => $integration[0]->password,
            'apiUsername' => $integration[0]->username
        ));

        $lists = $oiContact->getLists();

        foreach( $lists as $list ) {
            $segments[] = array(
                'id'            => (String) $list->listId,
                'integrationId' => $integrationId,
                'name'          => $list->name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $oiContact = iContactApi::getInstance()->setConfig(array(
            'appId'       => $apiKey,
            'apiPassword' => $password,
            'apiUsername' => $username
        ));

        $arrAddParam = array(
            'email'       => trim($email), 
            'firstName'   => trim($firstName),
            'lastName'    => trim($lastName),
            'phone'       => trim($phone),
            'quiz_result' => trim($result)
        );
        
        $checkRec = $oiContact->addContact($arrAddParam);

        if( is_object( $checkRec ) ) {
            $oiContact->subscribeContactToList( $checkRec->contactId, $campaignId, 'normal' ); 
        }
    }
}
