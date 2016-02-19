<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");
require_once("Infusionsoft/isdk.php");

class infusionsoft extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $app = new iSDK;

        $_SESSION['username'] = $username;
        $_SESSION['apiKey']   = $apiKey;

		return $app->cfgCon("connectionName");
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $app = new iSDK;

        $_SESSION['username'] = $integration[0]->username;
        $_SESSION['apiKey']   = $integration[0]->apiKey;

        $app->cfgCon("connectionName");

        $tags = array();
        $segments = array();

        $fields = array('Id','GroupName');
        $query  = array('Id' => '%');
        $tags = $app->dsQuery('ContactGroup', 1000, 0, $query, $fields);

        foreach( $tags as $tag ) {
            $segments[] = array(
                'id'            => (String) $tag['Id'],
                'integrationId' => $integrationId,
                'name'          => $tag['GroupName'] );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $app = new iSDK;
        
        $_SESSION['username'] = $username;
        $_SESSION['apiKey']   = $apiKey;

        if( $app->cfgCon("connectionName") ) {
            $contactData = array(
                'FirstName' => $firstName,
                'LastName'  => $lastName,
                'Email'     => $email,
                'Phone1'    => $phone
            );

            $contactId = $app->addWithDupCheck($contactData, 'Email');

            $tagId = $app->grpAssign( $contactId, $campaignId );

            // Opt-in email
            $app->optIn($email, "Quiz subscriber");

            return true;
        } else {
            return false;
        }
    }
}
