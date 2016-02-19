<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor.php");

class bronto extends Vendor {
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        $client = new SoapClient('http://api.bronto.com/v4?wsdl', array('trace' => 1, 'features' => SOAP_SINGLE_ELEMENT_ARRAYS));

        $result = $client->login(array('apiToken' => $apiKey))->return;

        return $result ? true : false;
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $lists = array();
        $segments = array();

        $client = new SoapClient('http://api.bronto.com/v4?wsdl', array('trace' => 1, 'features' => SOAP_SINGLE_ELEMENT_ARRAYS));

        $sessionId = $client->login(array('apiToken' => $integration[0]->apiKey))->return;

        $session_header = new SoapHeader("http://api.bronto.com/v4", 'sessionHeader', array('sessionId' => $sessionId));

        $client->__setSoapHeaders(array($session_header));

        $lists = $client->readLists(array('pageNumber' => 1, 'filter' => array()))->return;

        foreach( $lists as $list ) {
            $segments[] = array(
                'id'            => (String) $list->id,
                'integrationId' => $integrationId,
                'name'          => $list->name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $apiKey, $username, $password, $token ) {
        $client = new SoapClient('http://api.bronto.com/v4?wsdl', array('trace' => 1, 'features' => SOAP_SINGLE_ELEMENT_ARRAYS));

        $sessionId = $client->login(array('apiToken' => $apiKey))->return;

        $session_header = new SoapHeader("http://api.bronto.com/v4",'sessionHeader', array('sessionId' => $sessionId));
     
        $client->__setSoapHeaders(array($session_header));
     
        // Add a contact. If the contact is new or already exists,
        // you will get back an ID.
        $contacts = array('email' => $email);
     
        $write_result = $client->addOrUpdateContacts(array($contacts) )->return;
     
         // The id returned will be used by the readContacts() call below.
         if (property_exists($write_result, 'errors') && $write_result->errors) {
            print_r($write_result->results);
            return false;
         } elseif ($write_result->results[0]->isNew == true) {
            //print "The contact has been added.  Id: " . $write_result->results[0]->id . "\n";
         } else {
            //print "The contact's informartion has been updated.  Id: " . $write_result->results[0]->id . "\n";
         }
     
        // Get IDs for all the fields in your account and store them
        // in an array. This array will be used in the readContacts()
        // call below.
     
        // Passing in an empty array for the filter will return
        // data for all the fields in your account.
        $filter = array();

        $fields = $client->readFields(array('pageNumber' => 1, 'filter' => $filter))->return;
        // Initialize the array that will hold
        // all of the field IDs. This gets used in
        // readContacts() below.
        $fieldIds = array();
        $fieldNames = array();
        // Loop through each field returned, print the ID, and
        // addd the id to the array.
        foreach ($fields as $field) {
            //print "Field id: " . $field->id . "\n";
            array_push($fieldIds, $field->id);
            $fieldNames[$field->id] = $field->name;
        }
     
        // Get the IDs for all of the lists in your account.
        // Passing in an emprty array for the filter will return
        // data for all the lists in your account.
        $filter = array();
     
        $lists = $client->readLists(array('pageNumber' => 1, 'filter' => $filter))->return;
     
        // Read data for the contact that was added/updated
        // We will return all the IDs for all the lists the contact
        // is subscribed to, and all of the field data associated
        // with the contact,
        $contactFilter = array(
            'id' => $write_result->results[0]->id
        );

        $contact = $client->readContacts(array('pageNumber' => 1,
                          'includeLists' => true,
                          'fields' => $fieldIds,
                          'filter' => $contactFilter,
                          )
                        )->return;
     
     
        // Update the contact object we got back
        // If the contact is currently subscribe to any lists, an array is returned
        // so add the new list ID to the array
        if (property_exists($contact[0], 'listIds') && $contact[0]->listIds) {
            array_push($contact[0]->listIds, $campaignId);
        // If the contact was no currently subscribed to any lists.
        } else {
            $contact[0]->listIds = $campaignId;
        }
     
        // Loop through the array of fields and find the specific one you want
        // to update (by ID). Update the field content.
        foreach ($contact[0]->fields as $field) {
            switch( $fieldNames[ $field->fieldId ] ) {
                case 'firstname':
                    $field->content = $firstName;
                    break;
                case 'lastname':
                    $field->content = $lastName;
                    break;
                case 'phone':
                    $field->content = $phone;
                    break;
                case 'result':
                    $field->content = $result;
                    break;
            }
        }
     
        // Here were are taking the modified contact object and updating
        // the contact.
        $write_result = $client->addOrUpdateContacts(array($contact[0]))->return;
     
         if (property_exists($write_result, 'errors') && $write_result->errors) {
            print_r($write_result->results);
            return false;
        } elseif ($write_result->results[0]->isNew == true) {
            //print "The contact has been added.  Id: " . $write_result->results[0]->id . "\n";
        } else {
            //print "The contact's informartion has been updated.  Id: " . $write_result->results[0]->id . "\n";
        }

        return true;
    }
}
