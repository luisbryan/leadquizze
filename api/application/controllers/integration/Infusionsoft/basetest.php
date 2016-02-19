<?php

session_start();

if(!$_SESSION['integrationData'][0]['username'] || $_SESSION['integrationData'][0]['username'] =='')
{

	include '../../../api/1.0/control.php';
	$base = new Base; // Get all functions as class methods
    $quiz_id = (isset($json["quiz_id"]) ? $json["quiz_id"] : "333");

  	$integrationData = json_decode($base->getISData($quiz_id), true);


  	$connInfo = array('connectionName:' . $integrationData[0]['username'] . ':i:' . $integrationData[0]['api'] . ':This is the connection for ' . $integrationData[0]['username'] . '.infusionsoft.com');
  	var_dump($connInfo);
 } 



 ?>