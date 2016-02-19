<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor_Oauth.php");
require_once("aweber/aweber_api.php");

define( "REDIRECT_URI", DOMAIN_ROOT . "api/integration/aw_endpoint/" );

class aweber extends Vendor_Oauth {

    public function getAuthorizationUrl( $userId, $vendorReferenceName, $apiKey, $apiSecret ) {
        return "https://auth.aweber.com/1.0/oauth/authorize_app/b6368462";
    }

    public function getAccessToken( $userId, $code, $apiKey, $apiSecret ) {
        $aWeberApp = new AWeberAPI( $apiKey, $apiSecret );

        $credentials = AWeberAPI::getDataFromAweberID( $code );

        list( $consumerKey, $consumerSecret, $accessKey, $accessSecret ) = $credentials;

        $aWeberAccount = $aWeberApp->getAccount( $accessKey, $accessSecret );

        return array('token' => $accessKey, 'password' => $accessSecret );
    }
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        // validation handled by oauth flow
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $aWeberApp = new AWeberAPI( $integration[0]->oauthKey, $integration[0]->oauthSecret );
        $aWeberAccount = $aWeberApp->getAccount( $integration[0]->token, $integration[0]->password );

        $lists = array();
        $segments = array();

        $listsUrl = "/accounts/{$aWeberAccount->id}/lists/";
        $lists = $aWeberAccount->loadFromUrl( $listsUrl );

        foreach( $lists as $list ) {
            $segments[] = array(
                'id'            => (String) $list->id,
                'integrationId' => $integrationId,
                'name'          => $list->name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $oauthKey, $oauthSecret, $password, $token ) {
        $aWeberApp = new AWeberAPI( $oauthKey, $oauthSecret );
        $aWeberAccount = $aWeberApp->getAccount( $token, $password );

        $listUrl = "/accounts/{$aWeberAccount->id}/lists/{$campaignId}";
        $list = $aWeberAccount->loadFromUrl( $listUrl );

        $params = array(
            'email' => $email,
            'ip_address' => '',
            'ad_tracking' => '',
            'misc_notes' => '',
            'name' => "$firstName $lastName"
        );

        $subscribers = $list->subscribers;
        $newSubscriber = $subscribers->create($params);

        return true;
    }
}
