<?php

	require_once("includes/ActiveCampaign.class.php");

	$ac = new ActiveCampaign("https://irenasoftare.api-us1.com", "e135e78c115c5bc8a67ecf341ea8171789aab411edb9b46cbad67f62df1c54e598b5f36e");

	/*
	 * TEST API CREDENTIALS.
	 */

	if (!(int)$ac->credentials_test()) {
		echo "<p>Access denied: Invalid credentials (URL and/or API key).</p>";
		exit();
	}
	
        echo "<p>Credentials valid! Proceeding...</p>";
	
	/*
	 * VIEW ACCOUNT DETAILS.
	 */

	$account = $ac->api("account/view");

	echo "<pre>";
	print_r($account);
	echo "</pre>";

        
        // successful request
        $list_id = 2;
        echo "<p>List added successfully (ID {$list_id})!</p>";

	/*
	 * ADD OR EDIT CONTACT (TO THE NEW LIST CREATED ABOVE).
	 */

	$contact = array(
		"email"              => "test1@example.com",
		"first_name"         => "Test",
		"last_name"          => "Test",
		"p[{$list_id}]"      => $list_id,
		"status[{$list_id}]" => 1, // "Active" status
	);

	$contact_sync = $ac->api("contact/sync", $contact);

	if (!(int)$contact_sync->success) {
		// request failed
		echo "<p>Syncing contact failed. Error returned: " . $contact_sync->error . "</p>";
		exit();
	}
        
        // successful request
        $contact_id = (int)$contact_sync->subscriber_id;
        echo "<p>Contact synced successfully (ID {$contact_id})!</p>";

	/*
	 * VIEW ALL CONTACTS IN A LIST (RETURNS ID AND EMAIL).
	 */

	$ac->version(2);
	$contacts_view = $ac->api("contact/list?listid=14&limit=500");

	$ac->version(1);

	
?>

<a href="http://www.activecampaign.com/api">View more API examples!</a>
