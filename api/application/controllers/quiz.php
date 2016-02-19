<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Quiz extends REST_Controller {
	
	public function getQuiz()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$quiz = $this->Quizzes->getQuiz($quizId);
			
			$output['status'] = true;
			$output['quiz'] = $quiz ? $quiz[0] : null;

			return $output;
		});
	}
	
	public function getQuizByLink()
	{
		$this->form_validation->set_rules('quizLink', 'quiz link', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizLink = $this->input->post('quizLink');

			$quiz = $this->Quizzes->getQuizByLink($quizLink);
			
			$output['status'] = true;
			$output['quiz'] = $quiz ? $quiz[0] : null;

			return $output;
		});
	}
	
	public function getQuizzesByUserId()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId = $this->input->post('userId');

			$quizzes = $this->Quizzes->getQuizzesByUserId($userId);
			
			$output['status'] = true;
			$output['quizzes'] = $quizzes;

			return $output;
		});
	}

	public function create()
	{
		$this->form_validation->set_rules('name', 'name', 'required|max_length[100]');
		$this->form_validation->set_rules('title', 'title', 'required|max_length[100]');
		$this->form_validation->set_rules('description', 'description', 'max_length[500]');
		$this->form_validation->set_rules('cta', 'call-to-action', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId         = $this->input->post('userId');
			$name           = $this->input->post('name');
			$title          = $this->input->post('title');
			$imageId        = $this->input->post('imageId')?$this->input->post('imageId'):null;
			$description    = $this->input->post('description')?$this->input->post('description'):'';
			$cta            = $this->input->post('cta');
			$analyticsId    = $this->input->post('analyticsId');
			$integrationId  = $this->input->post('integrationId');
			$segmentid      = $this->input->post('segmentid');
			$hasSocialShare = $this->input->post('hasSocialShare') == 'true' ? 1 : 0;
			$hasStartPage   = $this->input->post('hasStartPage') == 'true' ? 1 : 0;

			$newQuizId = $this->Quizzes->create( $userId, $name, $title, $imageId, $description, $cta, $analyticsId, $integrationId, $segmentid, $hasSocialShare, $hasStartPage );

			$output['status'] = true;
			$output['quizId'] = $newQuizId;

			return $output;
		});
	}

	public function update()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		$this->form_validation->set_rules('name', 'name', 'max_length[100]');
		$this->form_validation->set_rules('title', 'title', 'max_length[100]');
		$this->form_validation->set_rules('description', 'description', 'max_length[100]');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId         = $this->input->post('quizId');
			$updateFields = array();

			if( $this->input->post('name') != null ) {
				$updateFields['name'] = $this->input->post('name');
			}
			if( $this->input->post('title') != null ) {
				$updateFields['title'] = $this->input->post('title');
			}
			if( $this->input->post('description') != null ) {
				$updateFields['description'] = $this->input->post('description');
			}
			if( $this->input->post('imageId') != null && $this->input->post('imageId') != 0 ) {
				$updateFields['imageId'] = $this->input->post('imageId');
			}
			if( $this->input->post('cta') != null ) {
				$updateFields['cta'] = $this->input->post('cta');
			}
			if( $this->input->post('analyticsId') != null ) {
				$updateFields['analyticsId'] = $this->input->post('analyticsId');
			}
			if( $this->input->post('integrationId') != null ) {
				$updateFields['integrationId'] = $this->input->post('integrationId');
			}
			if( $this->input->post('segmentid') != null ) {
				$updateFields['segmentid'] = $this->input->post('segmentid');
			}
			if( $this->input->post('hasSocialShare') != null ) {
				$updateFields['hasSocialShare'] = $this->input->post('hasSocialShare') == 'true' ? 1 : 0;
			}
			if( $this->input->post('hasStartPage') != null ) {
				$updateFields['hasStartPage'] = $this->input->post('hasStartPage') == 'true' ? 1 : 0;
			}

			$this->Quizzes->update( $quizId, $updateFields );

			$output['status'] = true;
			$output['quizId'] = $quizId;

			return $output;
		});
	}

	public function duplicateQuiz()
	{
		$this->form_validation->set_rules('userId', 'user ID', 'required');
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$userId = $this->input->post('userId');
			$quizId = $this->input->post('quizId');

			$newQuizId = $this->Quizzes->duplicateQuiz( $userId, $quizId );

			$output['status'] = true;
			$output['quizId'] = $newQuizId;

			return $output;
		});
	}

	public function setQuizStatus()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		$this->form_validation->set_rules('status', 'status', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');
			$status = $this->input->post('status');

			$this->Quizzes->setQuizStatus( $quizId, $status );

			$output['status'] = true;

			return $output;
		});
	}

	public function uploadQuizImg() {
		//set the path where the files uploaded will be copied. NOTE if using linux, set the folder to permission 777
		$config['upload_path'] = '../images/uploads/quiz/';
		
    	// set the filter image types
		$config['allowed_types'] = 'gif|jpg|png';
		
		//load the upload library
		$this->load->library('upload', $config);
    
	    $this->upload->initialize($config);
	    
	    $this->upload->set_allowed_types('*');

		$output['upload_data'] = '';
    
		//if not successful, set the error message
		if (!$this->upload->do_upload('file')) {
			$output['error'] = $this->upload->display_errors();
		} else { //else, set the success message
			$output['status'] = true;
      
      		$upload_data = $this->upload->data();

			$imageId = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

			rename( $config['upload_path'] . $upload_data['file_name'], $config['upload_path'] . $imageId . $upload_data['file_ext'] );

			$output['imageId'] = $imageId . $upload_data['file_ext'];
		}

		echo json_encode( $output );
	}

	// OUTCOMES ----------------------
	
	public function getOutcomes()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$outcomes = $this->Quizzes->getOutcomes($quizId);
			
			$output['status'] = true;
			$output['outcomes'] = $outcomes;

			return $output;
		});
	}

	public function addOutcome()
	{
		$this->form_validation->set_rules('title', 'title', 'required|max_length[100]');
		$this->form_validation->set_rules('body', 'body', 'max_length[8000]');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');
			$title  = $this->input->post('title');
			$body   = $this->input->post('body');

			$newOutcomeId = $this->Quizzes->addOutcome( $quizId, $title, $body );

			$output['status'] = true;
			$output['outcomeId'] = $newOutcomeId;

			return $output;
		});
	}

	public function updateOutcome()
	{
		$this->form_validation->set_rules('outcomeId', 'outcome ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$outcomeId = $this->input->post('outcomeId');
			$updateFields = array();

			if( $this->input->post('title') != null ) {
				$updateFields['title'] = $this->input->post('title');
			}
			if( $this->input->post('body') != null ) {
				$updateFields['body'] = $this->input->post('body');
			}

			$this->Quizzes->updateOutcome( $outcomeId, $updateFields );

			$output['status'] = true;
			$output['outcomeId'] = $outcomeId;

			return $output;
		});
	}

	public function deleteOutcome()
	{
		$this->form_validation->set_rules('outcomeId', 'outcome ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$outcomeId = $this->input->post('outcomeId');

			$this->Quizzes->deleteOutcome( $outcomeId );

			$output['status'] = true;

			return $output;
		});
	}

	public function uploadOutcomeImg() {
		//set the path where the files uploaded will be copied. NOTE if using linux, set the folder to permission 777
		$config['upload_path'] = '../images/uploads/outcome/';
		
    	// set the filter image types
		$config['allowed_types'] = 'gif|jpg|png';
		
		//load the upload library
		$this->load->library('upload', $config);
    
	    $this->upload->initialize($config);
	    
	    $this->upload->set_allowed_types('*');

		$output['upload_data'] = '';
    
		//if not successful, set the error message
		if (!$this->upload->do_upload('file')) {
			$output['error'] = $this->upload->display_errors();
		} else { //else, set the success message
			$output['status'] = true;
      
      		$upload_data = $this->upload->data();

			$imageId = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

			rename( $config['upload_path'] . $upload_data['file_name'], $config['upload_path'] . $imageId . $upload_data['file_ext'] );

			$output['imageId'] = $imageId . $upload_data['file_ext'];
		}

		echo json_encode( $output );
	}

	// QUESTIONS ----------------------
	
	public function getQuestions()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$questions = $this->Quizzes->getQuestions($quizId);
			
			$output['status'] = true;
			$output['questions'] = $questions;

			return $output;
		});
	}

	public function addQuestion()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		$this->form_validation->set_rules('questionText', 'question text', 'required|max_length[150]');
		$this->form_validation->set_rules('answerStructA', 'answer structure', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId        = $this->input->post('quizId');
			$questionText  = $this->input->post('questionText');
			$answerStructA = $this->input->post('answerStructA');
			$answerStructB = $this->input->post('answerStructB');
			$answerStructC = $this->input->post('answerStructC');
			$answerStructD = $this->input->post('answerStructD');
			$answerStructE = $this->input->post('answerStructE');

			$newQuestionId = $this->Quizzes->addQuestion( $quizId, $questionText, $answerStructA, $answerStructB, $answerStructC, $answerStructD, $answerStructE );

			$output['status'] = true;
			$output['questionId'] = $newQuestionId;

			return $output;
		});
	}

	public function updateQuestion()
	{
		$this->form_validation->set_rules('questionId', 'question ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$questionId = $this->input->post('questionId');
			$updateFields = array();

			if( $this->input->post('questionText') != null ) {
				$updateFields['questionText'] = $this->input->post('questionText');
			}
			$updateFields['answerStructA'] = $this->input->post('answerStructA');
			$updateFields['answerStructB'] = $this->input->post('answerStructB');
			$updateFields['answerStructC'] = $this->input->post('answerStructC');
			$updateFields['answerStructD'] = $this->input->post('answerStructD');
			$updateFields['answerStructE'] = $this->input->post('answerStructE');

			$this->Quizzes->updateQuestion( $questionId, $updateFields );

			$output['status'] = true;
			$output['questionId'] = $questionId;

			return $output;
		});
	}

	public function deleteQuestion()
	{
		$this->form_validation->set_rules('questionId', 'question ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$questionId = $this->input->post('questionId');

			$this->Quizzes->deleteQuestion( $questionId );

			$output['status'] = true;

			return $output;
		});
	}

	// CAPTURE SETTINGS ----------------------

	public function getCaptureSettings()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$captureSettings = $this->Quizzes->getCaptureSettings($quizId);
			
			$output['status'] = true;
			$output['captureSettings'] = $captureSettings ? $captureSettings[0] : null;

			return $output;
		});
	}

	public function saveCaptureSettings()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');
		$this->form_validation->set_rules('captureEnabled', 'capture enabled', 'required');
		$this->form_validation->set_rules('leadType', 'lead type', 'required');

		$this->form_validation->set_rules('socialCaptureHeadline', 'social capture headline', 'required|max_length[100]');
		$this->form_validation->set_rules('socialCaptureDescription', 'social capture description', 'max_length[500]');
		$this->form_validation->set_rules('socialCapturePlacement', 'social capture placement', 'required');
		$this->form_validation->set_rules('socialCapturePrivacyPolicy', 'social capture privacy policy', 'max_length[500]');
		$this->form_validation->set_rules('socialCaptureDisclaimerUrl', 'social capture disclaimer URL', 'max_length[100]');

		$this->form_validation->set_rules('leadCaptureHeadline', 'lead capture headline', 'required|max_length[100]');
		$this->form_validation->set_rules('leadCaptureDescription', 'lead capture description', 'max_length[500]');
		$this->form_validation->set_rules('leadCapturePlacement', 'lead capture placement', 'required');
		$this->form_validation->set_rules('leadCaptureConversionCode', 'lead capture conversion code', 'max_length[8000]');
		$this->form_validation->set_rules('leadCapturePrivacyPolicy', 'lead capture privacy policy', 'max_length[500]');
		$this->form_validation->set_rules('leadCaptureDisclaimerUrl', 'lead capture disclaimerUrl', 'max_length[100]');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId         = $this->input->post('quizId');
			$captureEnabled = $this->input->post('captureEnabled') == 'true' ? 1 : 0;
			$leadType       = $this->input->post('leadType');

			$socialCaptureHeadline      = $this->input->post('socialCaptureHeadline');
			$socialCaptureDescription   = $this->input->post('socialCaptureDescription');
			$socialCapturePlacement     = $this->input->post('socialCapturePlacement');
			$socialCaptureSkippable     = $this->input->post('socialCaptureSkippable') == 'true' ? 1 : 0;
			$socialCapturePrivacyPolicy = $this->input->post('socialCapturePrivacyPolicy');
			$socialCaptureDisclaimerUrl = $this->input->post('socialCaptureDisclaimerUrl');

			$leadCaptureHeadline        = $this->input->post('leadCaptureHeadline');
			$leadCaptureDescription     = $this->input->post('leadCaptureDescription');
			$leadCapturePlacement       = $this->input->post('leadCapturePlacement');
			$leadCaptureCta             = $this->input->post('leadCaptureCta');
			$leadCaptureFirstEnabled    = $this->input->post('leadCaptureFirstEnabled') == 'true' ? 1 : 0;
			$leadCaptureLastEnabled     = $this->input->post('leadCaptureLastEnabled') == 'true' ? 1 : 0;
			$leadCaptureEmailEnabled    = $this->input->post('leadCaptureEmailEnabled') == 'true' ? 1 : 0;
			$leadCapturePhoneEnabled    = $this->input->post('leadCapturePhoneEnabled') == 'true' ? 1 : 0;
			$leadCaptureSkippable       = $this->input->post('leadCaptureSkippable') == 'true' ? 1 : 0;
			$leadCaptureConversionCode  = $this->input->post('leadCaptureConversionCode');
			$leadCapturePrivacyPolicy   = $this->input->post('leadCapturePrivacyPolicy');
			$leadCaptureDisclaimerUrl   = $this->input->post('leadCaptureDisclaimerUrl');

			$captureSettingsId = $this->Quizzes->saveCaptureSettings( 
				$quizId,
				$captureEnabled,
				$leadType,
				$socialCaptureHeadline,
				$socialCaptureDescription,
				$socialCapturePlacement,
				$socialCaptureSkippable,
				$socialCapturePrivacyPolicy,
				$socialCaptureDisclaimerUrl,
				$leadCaptureHeadline,
				$leadCaptureDescription,
				$leadCapturePlacement,
				$leadCaptureCta,
				$leadCaptureFirstEnabled,
				$leadCaptureLastEnabled,
				$leadCaptureEmailEnabled,
				$leadCapturePhoneEnabled,
				$leadCaptureSkippable,
				$leadCaptureConversionCode,
				$leadCapturePrivacyPolicy,
				$leadCaptureDisclaimerUrl );

			$output['status'] = true;
			$output['captureSettingsId'] = $captureSettingsId;

			return $output;
		});
	}

	// OFFERS ----------------------

	public function saveOffer()
	{
		$this->form_validation->set_rules('outcomeId', 'outcome ID', 'required');
		$this->form_validation->set_rules('offerEnabled', 'offer enabled', 'required');
		$this->form_validation->set_rules('offerType', 'offer type', 'required');
		$this->form_validation->set_rules('offerHeadline', 'offer headline', 'max_length[100]');
		$this->form_validation->set_rules('offerDescription', 'offer description', 'max_length[500]');
		$this->form_validation->set_rules('offerCta', 'offer call-to-action', 'max_length[100]');
		$this->form_validation->set_rules('offerUrl', 'offer URL', 'max_length[500]');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$outcomeId        = $this->input->post('outcomeId');
			$offerEnabled     = $this->input->post('offerEnabled') == 'true' ? 1 : 0;
			$offerType        = $this->input->post('offerType');
			$offerHeadline    = $this->input->post('offerHeadline')?$this->input->post('offerHeadline'):'';
			$offerDescription = $this->input->post('offerDescription')?$this->input->post('offerDescription'):'';
			$offerImage       = $this->input->post('offerImage')?$this->input->post('offerImage'):'';
			$offerCta         = $this->input->post('offerCta')?$this->input->post('offerCta'):'';
			$offerUrl         = $this->input->post('offerUrl');

			$offerId = $this->Quizzes->saveOffer(  $outcomeId, $offerEnabled, $offerType, $offerHeadline, $offerDescription, $offerImage, $offerCta, $offerUrl );

			$output['status'] = true;
			$output['offerId'] = $offerId;

			return $output;
		});
	}

	// OTHER -------------------------

	public function verifyEmail()
	{
		$email = $this->input->post('email');

	    $curl = curl_init("http://apilayer.net/api/check?access_key=ba3abdbf9f0f3cb80ff54c0b9fca0177&email=$email&smtp=1&format=1");
	    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	    $result = curl_exec( $curl );
	    echo $result;
	}

	public function uploadOfferImg() {
		//set the path where the files uploaded will be copied. NOTE if using linux, set the folder to permission 777
		$config['upload_path'] = '../images/uploads/offer/';
		
    	// set the filter image types
		$config['allowed_types'] = 'gif|jpg|png';
		
		//load the upload library
		$this->load->library('upload', $config);
    
	    $this->upload->initialize($config);
	    
	    $this->upload->set_allowed_types('*');

		$output['upload_data'] = '';
    
		//if not successful, set the error message
		if (!$this->upload->do_upload('file')) {
			$output['error'] = $this->upload->display_errors();
		} else { //else, set the success message
			$output['status'] = true;
      
      		$upload_data = $this->upload->data();

			$offerImage = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);

			rename( $config['upload_path'] . $upload_data['file_name'], $config['upload_path'] . $offerImage . $upload_data['file_ext'] );

			$output['offerImage'] = $offerImage . $upload_data['file_ext'];
		}

		echo json_encode( $output );
	}
	
	public function getIndustryList()
	{
		$industries = $this->Quizzes->getIndustryList();
		
		$output['status'] = true;
		$output['industries'] = $industries;

		echo json_encode( $output );
	}

}

/* End of file quiz.php */
/* Location: ./application/controllers/quiz.php */