<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");

abstract class Vendor_Oauth extends Vendor {

    abstract public function getAuthorizationUrl( $userId, $vendorReferenceName, $apiKey, $apiSecret );
    
    abstract public function getAccessToken( $userId, $code, $apiKey, $apiSecret );

}
