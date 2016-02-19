<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");

class ontraport extends Vendor {
    
    public function validateCredentials( $apiKey, $username, $password, $token ) {
        $additionalHeaders = array(
            array(
                'header' => CURLOPT_HTTPHEADER,
                'value'  => array(
                    'Content-Type: application/json',
                    "Api-Appid:$username",
                    "Api-Key:$apiKey" ) ) );

        $result = $this->curlCall( 'https://api.ontraport.com/1/objects', array('objectID' => '0'), $additionalHeaders );

        return ($result->account_id) ? true : false;
    }

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        /* for some reason, cURL refuses to send any requests to Ontraport using GET and only
           does POST so it was impossible to get tags via cURL. This is a work-around to force
           a GET request */
        $opts = array(
            'http' => array(
                'method' => "GET",
                'header' => "Api-Appid:{$integration[0]->username}\r\n" .
                            "Api-Key:{$integration[0]->apiKey}\r\n"
            )
        );
        $result = file_get_contents( 'https://api.ontraport.com/1/objects?objectID=14', false, stream_context_create( $opts ) );

        $decoded = json_decode( $result );

        foreach( $decoded->data as $tag ) {
            $segments[] = array(
                'id'            => (String) $tag->tag_id,
                'integrationId' => $integrationId,
                'name'          => $tag->tag_name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $additionalHeaders = array(
            array(
                'header' => CURLOPT_HTTPHEADER,
                'value'  => array(
                    'Content-Type: application/json',
                    "Api-Appid:$username",
                    "Api-Key:$apiKey" ) ) );


        $parameters = array(
            'objectID'      => 0,
            'firstname'     => $firstName,
            'lastname'      => $lastName,
            'email'         => $email,
            'home_phone'    => $phone,
            'lead_source'   => 'LeadQuizzes',
            'referral_page' => 'Lead Quizzes',
            'notes'         => "Quiz Result: $result" );
        $result = $this->curlCall( 'https://api.ontraport.com/1/objects', $parameters, $additionalHeaders );


        /* for some reason, cURL refuses to send any requests to Ontraport using PUT and only
           does POST so it was impossible to get tags via cURL. This is a work-around to force
           a PUT request */
        $tagParams = http_build_query( array(
            'objectID' => 0,
            'ids'      => $result->data->id,
            'add_list' => $campaignId ) );
        $opts = array(
            'http' => array(
                'method' => "PUT",
                'header' => "Content-Length: " . strlen($tagParams) . "\r\n" . 
                            "Content-Type: application/json\r\n" .
                            "Api-Appid:{$username}\r\n" .
                            "Api-Key:{$apiKey}\r\n",
                'content' => $tagParams
            )
        );
        $result = file_get_contents( 'https://api.ontraport.com/1/objects/tag', false, stream_context_create( $opts ) );

        return true;
    }
}
