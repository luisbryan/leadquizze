<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Quizzes extends CI_Model {

	public function getQuiz($quizId)
	{
		$this->db->select('*');
		$this->db->from('quizzes');
		$this->db->where('quizId', $quizId);
		$this->db->limit(1);

		$query = $this->db->get();

		return $query->result();
	}

	public function getQuizByLink($quizLink)
	{
		$this->db->select('*, users.userLogo, users.website');
		$this->db->from('quizzes');
		$this->db->where('quizLink', $quizLink);
		$this->db->join('users', 'users.id = quizzes.userId', 'left');
		$this->db->limit(1);

		$query = $this->db->get();

		return $query->result();
	}

	public function getQuizzesByUserId($userId)
	{
		$this->db->select('quizzes.*, quizStatuses.quizStatusName, count(activityId) as views, sum(quizCompleted) as quizzesCompleted, sum(leadCaptured) as leadsCaptured, sum(ctaClicked) as ctaClicks, sum(shareCount) as shareCount');
		$this->db->from('quizzes');
		$this->db->where('userId', $userId);
		$this->db->where('quizStatusName !=', 'Deleted');
		$this->db->join('quizStatuses', 'quizzes.status = quizStatuses.quizStatusId', 'left');
		$this->db->join('activity', 'quizzes.quizId = activity.quizId', 'left');
		$this->db->order_by('quizzes.created', "desc"); 
		$this->db->group_by('quizzes.quizId');

		$query = $this->db->get();

		return $query->result();
	}
    
	public function create( $userId, $name, $title, $imageId, $description, $cta, $analyticsId = '', $integrationId, $segmentid = '', $hasSocialShare = 0, $hasStartPage = 0 )
	{
		$this->db->set('userId',          $userId);
		$this->db->set('name',            $name);
		$this->db->set('title',           $title);
		$this->db->set('imageId',         $imageId);
		$this->db->set('description',     $description);
		$this->db->set('cta',             $cta);
		$this->db->set('analyticsId',     $analyticsId);
		$this->db->set('integrationId',   $integrationId);
		$this->db->set('segmentid',       $segmentid);
		$this->db->set('quizLink',        substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6));
		$this->db->set('hasSocialShare',  $hasSocialShare);
		$this->db->set('hasStartPage',    $hasStartPage);

		$this->db->insert('quizzes');

		return $this->db->insert_id();
	}
    
	public function update( $quizId, $updateFields )
	{
		$this->db->where('quizId', $quizId);
		$this->db->update('quizzes', $updateFields); 
	}

	public function duplicateQuiz( $userId, $quizId )
	{
		$quiz = $this->getQuiz($quizId);

		$newQuizId = $this->create(
			$userId,
			$quiz[0]->name,
			$quiz[0]->title,
			$quiz[0]->imageId,
			$quiz[0]->description,
			$quiz[0]->cta,
			$quiz[0]->analyticsid,
			$quiz[0]->integrationId,
			$quiz[0]->segmentid,
			$quiz[0]->hasSocialShare,
			$quiz[0]->hasStartPage );

		$outcomes = $this->getOutcomes($quizId);
		foreach( $outcomes as $outcome ) {
			$newOutcomeId = $this->addOutcome(
				$newQuizId,
				$outcome->title,
				$outcome->body );

			if( $outcome->offerEnabled !== null ) {
				$this->saveOffer(
					$newOutcomeId,
					$outcome->offerEnabled,
					$outcome->offerType,
					$outcome->offerHeadline,
					$outcome->offerDescription,
					$outcome->offerImage,
					$outcome->offerCta,
					$outcome->offerUrl );
			}
		}

		$questions = $this->getQuestions($quizId);
		foreach( $questions as $question ) {
			$this->addQuestion(
				$newQuizId,
				$question->questionText,
				$question->answerStructA,
				$question->answerStructB,
				$question->answerStructC,
				$question->answerStructD,
				$question->answerStructE );
		}

		$captureSettings = $this->getCaptureSettings($quizId);

		if( !empty( $captureSettings ) ) {
			$this->saveCaptureSettings(
				$newQuizId,
				$captureSettings[0]->captureEnabled,
				$captureSettings[0]->leadType,
				$captureSettings[0]->socialCaptureHeadline,
				$captureSettings[0]->socialCaptureDescription,
				$captureSettings[0]->socialCapturePlacement,
				$captureSettings[0]->socialCaptureSkippable,
				$captureSettings[0]->socialCapturePrivacyPolicy,
				$captureSettings[0]->socialCaptureDisclaimerUrl,
				$captureSettings[0]->leadCaptureHeadline,
				$captureSettings[0]->leadCaptureDescription,
				$captureSettings[0]->leadCapturePlacement,
				$captureSettings[0]->leadCaptureCta,
				$captureSettings[0]->leadCaptureFirstEnabled,
				$captureSettings[0]->leadCaptureLastEnabled,
				$captureSettings[0]->leadCaptureEmailEnabled,
				$captureSettings[0]->leadCapturePhoneEnabled,
				$captureSettings[0]->leadCaptureSkippable,
				$captureSettings[0]->leadCaptureConversionCode,
				$captureSettings[0]->leadCapturePrivacyPolicy,
				$captureSettings[0]->leadCaptureDisclaimerUrl );
		}

		return $newQuizId;
	}
    
	public function setQuizStatus( $quizId, $status )
	{
		$this->db->where('quizId', $quizId);
		$this->db->update('quizzes', array( 'status' => $status ) ); 
	}

	// OUTCOMES -----------------

	public function getOutcomes($quizId)
	{
		$this->db->select('outcomes.*, offers.*, outcomes.outcomeId as outcomeId');
		$this->db->from('outcomes');
		$this->db->join('offers', 'outcomes.outcomeId = offers.outcomeId', 'left');
		$this->db->where('quizId', $quizId);
		$this->db->order_by('outcomes.outcomeId', "asc"); 

		$query = $this->db->get();

		return $query->result();
	}
    
	public function addOutcome( $quizId, $title, $body )
	{
		$this->db->set('quizId', $quizId);
		$this->db->set('title',  $title);
		$this->db->set('body',   $body);

		$this->db->insert('outcomes');

		return $this->db->insert_id();
	}
    
	public function updateOutcome( $outcomeId, $updateFields )
	{
		$this->db->where('outcomeId', $outcomeId);
		$this->db->update('outcomes', $updateFields); 
	}
    
	public function deleteOutcome( $outcomeId )
	{
		$this->db->where('outcomeId', $outcomeId);
		$this->db->delete('outcomes');
		$this->db->limit(1);
	}

	// QUESTIONS -----------------

	public function getQuestions($quizId)
	{
		$this->db->select('*');
		$this->db->from('questions');
		$this->db->where('quizId', $quizId);
		$this->db->order_by('questionId', "asc"); 

		$query = $this->db->get();

		return $query->result();
	}
    
	public function addQuestion( $quizId, $questionText, $answerStructA, $answerStructB, $answerStructC, $answerStructD, $answerStructE )
	{
		$this->db->set('quizId',        $quizId);
		$this->db->set('questionText',  $questionText);
		$this->db->set('answerStructA', $answerStructA);
		$this->db->set('answerStructB', $answerStructB);
		$this->db->set('answerStructC', $answerStructC);
		$this->db->set('answerStructD', $answerStructD);
		$this->db->set('answerStructE', $answerStructE);

		$this->db->insert('questions');

		return $this->db->insert_id();
	}
    
	public function updateQuestion( $questionId, $updateFields )
	{
		$this->db->where('questionId', $questionId);
		$this->db->update('questions', $updateFields); 
	}
    
	public function deleteQuestion( $questionId )
	{
		$this->db->where('questionId', $questionId);
		$this->db->delete('questions');
		$this->db->limit(1);
	}

	// CAPTURE SETTINGS -----------------

	public function getCaptureSettings($quizId)
	{
		$this->db->select('*');
		$this->db->from('captureSettings');
		$this->db->where('quizId', $quizId);

		$query = $this->db->get();

		return $query->result();
	}

	public function saveCaptureSettings( $quizId, $captureEnabled, $leadType, $socialCaptureHeadline, $socialCaptureDescription, $socialCapturePlacement, $socialCaptureSkippable, $socialCapturePrivacyPolicy, $socialCaptureDisclaimerUrl, $leadCaptureHeadline, $leadCaptureDescription, $leadCapturePlacement, $leadCaptureCta, $leadCaptureFirstEnabled, $leadCaptureLastEnabled, $leadCaptureEmailEnabled, $leadCapturePhoneEnabled, $leadCaptureSkippable, $leadCaptureConversionCode, $leadCapturePrivacyPolicy, $leadCaptureDisclaimerUrl )
	{
		$this->db->where('quizId', $quizId);
		$this->db->delete('captureSettings'); // nuke previous settings if there are any
		$this->db->limit(1);

		$this->db->set('quizId',                     $quizId);
		$this->db->set('captureEnabled',             $captureEnabled);
		$this->db->set('leadType',                   $leadType);
		$this->db->set('socialCaptureHeadline',      $socialCaptureHeadline);
		$this->db->set('socialCaptureDescription',   $socialCaptureDescription);
		$this->db->set('socialCapturePlacement',     $socialCapturePlacement);
		$this->db->set('socialCaptureSkippable',     $socialCaptureSkippable);
		$this->db->set('socialCapturePrivacyPolicy', $socialCapturePrivacyPolicy);
		$this->db->set('socialCaptureDisclaimerUrl', $socialCaptureDisclaimerUrl);
		$this->db->set('leadCaptureHeadline',        $leadCaptureHeadline);
		$this->db->set('leadCaptureDescription',     $leadCaptureDescription);
		$this->db->set('leadCapturePlacement',       $leadCapturePlacement);
		$this->db->set('leadCaptureCta',             $leadCaptureCta);
		$this->db->set('leadCaptureFirstEnabled',    $leadCaptureFirstEnabled);
		$this->db->set('leadCaptureLastEnabled',     $leadCaptureLastEnabled);
		$this->db->set('leadCaptureEmailEnabled',    $leadCaptureEmailEnabled);
		$this->db->set('leadCapturePhoneEnabled',    $leadCapturePhoneEnabled);
		$this->db->set('leadCaptureSkippable',       $leadCaptureSkippable);
		$this->db->set('leadCaptureConversionCode',  $leadCaptureConversionCode);
		$this->db->set('leadCapturePrivacyPolicy',   $leadCapturePrivacyPolicy);
		$this->db->set('leadCaptureDisclaimerUrl',   $leadCaptureDisclaimerUrl);

		$this->db->insert('captureSettings');

		return $this->db->insert_id();
	}

	// OFFERS -----------------

	public function saveOffer( $outcomeId, $offerEnabled, $offerType, $offerHeadline, $offerDescription, $offerImage, $offerCta, $offerUrl )
	{
		$this->db->where('outcomeId', $outcomeId);
		$this->db->delete('offers'); // nuke previous offer if there is one
		$this->db->limit(1);

		$this->db->set('outcomeId',        $outcomeId);
		$this->db->set('offerEnabled',     $offerEnabled);
		$this->db->set('offerType',        $offerType);
		$this->db->set('offerHeadline',    $offerHeadline);
		$this->db->set('offerDescription', $offerDescription);
		$this->db->set('offerImage',       $offerImage);
		$this->db->set('offerCta',         $offerCta);
		$this->db->set('offerUrl',         $offerUrl);

		$this->db->insert('offers');

		return $this->db->insert_id();
	}

	public function getIndustryList()
	{
		$this->db->select('segmentid as industry');
		$this->db->from('quizzes');
		$this->db->where('userId', 1);

		$query = $this->db->get();

		return $query->result();
	}
}

/* End of file quizzes.php */
/* Location: ./application/models/quizzes.php */