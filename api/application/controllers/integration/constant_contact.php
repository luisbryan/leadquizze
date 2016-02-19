<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("Vendor_Oauth.php");
require_once("Ctct/autoload.php");

use Ctct\Auth\CtctOAuth2;
use Ctct\Exceptions\OAuth2Exception;

use Ctct\ConstantContact;
use Ctct\Components\Contacts\Contact;
use Ctct\Exceptions\CtctException;

define( "REDIRECT_URI", DOMAIN_ROOT . "api/integration/cc_endpoint/" );

class constant_contact extends Vendor_Oauth {

    public function getAuthorizationUrl( $userId, $vendorReferenceName, $apiKey, $apiSecret ) {
        $redirectUri = REDIRECT_URI . "?userId=".$userId;

        $oauth = new CtctOAuth2( $apiKey, $apiSecret, $redirectUri );

        return $oauth->getAuthorizationUrl();
    }

    public function getAccessToken( $userId, $code, $apiKey, $apiSecret ) {
        $redirectUri = REDIRECT_URI . "?userId=".$userId;

        $oauth = new CtctOAuth2( $apiKey, $apiSecret, $redirectUri );

        $result = $oauth->getAccessToken( $code );

        return array( 'token' => $result['access_token'] );
    }
	
	public function validateCredentials( $apiKey, $username, $password, $token ) {
        // validation handled by oauth flow
	}

    public function getIntegrationSegments( $integrationId ) {
        $integration = $this->getIntegration( $integrationId );

        $cc = new ConstantContact($integration[0]->oauthKey);

        $lists = array();
        $segments = array();

        $lists = $cc->getLists($integration[0]->token);

        foreach( $lists as $list ) {
            $segments[] = array(
                'id'            => (String) $list->id,
                'integrationId' => $integrationId,
                'name'          => $list->name );
        }

        return $segments;
    }

    public function saveContact( $campaignId, $email, $firstName, $lastName, $phone, $result, $oauthKey, $username, $password, $token ) {
        $cc = new ConstantContact($oauthKey);

        // check if the form was submitted
        $action = "Getting Contact By Email Address";
        try {
            // check to see if a contact with the email addess already exists in the account
            $response = $cc->getContactByEmail($token, $email);

            // create a new contact if one does not exist
            if (empty($response->results)) {
                $action = "Creating Contact";

                $contact = new Contact();
                $contact->addEmail($email);
                $contact->addList($campaignId);
                if($firstName != "") {
                    $contact->first_name = $firstName;
                }
                if($lastName != "") {
                    $contact->last_name = $lastName;
                }
                if($phone != "") {
                    $contact->cell_phone = $phone;
                }
                $contact->custom_fields = array(array('name' => 'custom_field_3', 'value' => $result));

                /*
                 * The third parameter of addContact defaults to false, but if this were set to true it would tell Constant
                 * Contact that this action is being performed by the contact themselves, and gives the ability to
                 * opt contacts back in and trigger Welcome/Change-of-interest emails.
                 *
                 * See: http://developer.constantcontact.com/docs/contacts-api/contacts-index.html#opt_in
                 */
                $returnContact = $cc->addContact($token, $contact, true);

                // update the existing contact if address already existed
            } else {
                $action = "Updating Contact";

                $contact = $response->results[0];
                $contact->addList($campaignId);
                if($firstName != "") {
                    $contact->first_name = $firstName;
                }
                if($lastName != "") {
                    $contact->last_name = $lastName;
                }
                if($phone != "") {
                    $contact->cell_phone = $phone;
                }
                $contact->custom_fields = array(array('name' => 'custom_field_3', 'value' => $result));

                /*
                 * The third parameter of updateContact defaults to false, but if this were set to true it would tell
                 * Constant Contact that this action is being performed by the contact themselves, and gives the ability to
                 * opt contacts back in and trigger Welcome/Change-of-interest emails.
                 *
                 * See: http://developer.constantcontact.com/docs/contacts-api/contacts-index.html#opt_in
                 */
                $returnContact = $cc->updateContact($token, $contact, true);

            }

            // catch any exceptions thrown during the process and print the errors to screen
        } catch (CtctException $ex) {
            return false;
        }

        return true;
    }
}
