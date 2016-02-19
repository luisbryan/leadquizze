<?php
@session_start();

class MP {
    //static $auth_token = "50386f930b9143750565df006073afe1f5e967c2";
    //static $url_api = "http://app.maropost.com/accounts/312/"; 

    private $auth_token;
    private $url_api;
    
    function setIntegrationCred($auth_token,$list_id)
    {

        $this->auth_token=$auth_token;
        $this->url_api="http://app.maropost.com/accounts/".$list_id."/";
    }

    function request($action, $endpoint, $dataArray) {
        $url = $this->url_api . $endpoint . ".json";
        $ch = curl_init();
        $dataArray['auth_token'] = $this->auth_token;
        $json = json_encode($dataArray);
        //curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 10 );
        curl_setopt($ch, CURLOPT_URL, $url);
        switch($action){
            case "POST":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
            case "GET":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
            case "PUT":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
            case "DELETE":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            break;
            default:
            break;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json','Accept: application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 600);
        $output = curl_exec($ch);
        curl_close($ch);
        $decoded = json_decode($output);
        return $decoded;
    }
}
?>