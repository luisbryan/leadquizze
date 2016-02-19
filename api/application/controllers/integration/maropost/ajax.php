<?php 
if(!isset($_GET['email']))
exit;	//No direct access without the email

if(trim($_GET['email'])=='' && strpos($_GET['email'],'@') === false)
exit;	//email can't be empty, and needs to at least contain the @ symbol. Not doing any fancy validation here.

//if(!isset($_GET['accountid']))
//exit;

//check list id
//if(!isset($_GET['listid']))
//exit;


	
require_once('httpful.phar');

//------------------------//
//      MaroPost API      //
//------------------------//

//Make sure you change the list ID here by replacing the ####
$url = 'http://api.maropost.com/accounts/'.$_GET['accountid'].'/lists/'.$_GET['listid'].'/contacts.json?auth_token=c6289163f80ae83797f2b11171fcefd2d4be3294';

$body = new stdClass;
$body->custom_field = new stdClass;
$body->contact = new stdClass;
$body->contact->email = $_GET['email'];
$body->custom_field->affid = $_GET['affid'];
$body->subscribe = true;

$response = \Httpful\Request::post($url)
    ->addHeaders(array(
        'Content-Type'=>'application/json',
        'Accept'=>'application/json'
    ))
    ->body(json_encode($body))
    ->send();
echo json_encode(1);
//var_dump($response);
exit;
?>