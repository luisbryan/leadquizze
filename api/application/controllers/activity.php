<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Activity extends REST_Controller {
	
	public function getActivityByQuizId()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$activity = $this->ActivityModel->getActivityByQuizId($quizId);
			
			$output['status'] = true;
			$output['activity'] = $activity;

			return $output;
		});
	}

	public function getActivityRecord()
	{
		$this->form_validation->set_rules('activityId', 'activity ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$activityId = $this->input->post('activityId');

			$activity = $this->ActivityModel->getActivityRecord($activityId);
			
			$output['status'] = true;
			$output['activity'] = $activity;

			return $output;
		});
	}

	public function addNewActivityRecord()
	{
		$this->form_validation->set_rules('quizId', 'quiz ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$quizId = $this->input->post('quizId');

			$newActivityId = $this->ActivityModel->addNewActivityRecord( $quizId );

			$output['status'] = true;
			$output['activityId'] = $newActivityId;

			return $output;
		});
	}

	public function incrementShareCount() {
		$this->form_validation->set_rules('activityId', 'activity ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$activityId = $this->input->post('activityId');

			$activity = $this->ActivityModel->getActivityRecord($activityId);

			$updateFields['shareCount'] = $activity[0]->shareCount + 1;

			$this->ActivityModel->updateActivityRecord( $activityId, $updateFields );

			$output['status'] = true;
			$output['activityId'] = $activityId;

			return $output;
		});

	}

	public function updateActivityRecord()
	{
		$this->form_validation->set_rules('activityId', 'activity ID', 'required');

		return Validation::validate($this, '', '', function($token, $output)
		{
			$activityId = $this->input->post('activityId');
			$updateFields = array();

			if( $this->input->post('quizCompleted') != null ) {
				$updateFields['quizCompleted'] = $this->input->post('quizCompleted');
			}

			if( $this->input->post('quizResult') != null ) {
				$updateFields['quizResult'] = $this->input->post('quizResult');
			}

			if( $this->input->post('leadCaptured') != null ) {
				$updateFields['leadCaptured'] = $this->input->post('leadCaptured');
			}

			if( $this->input->post('ctaClicked') != null ) {
				$updateFields['ctaClicked'] = $this->input->post('ctaClicked');
			}

			if( $this->input->post('shareCount') != null ) {
				$updateFields['shareCount'] = $this->input->post('shareCount');
			}

			if( $this->input->post('firstName') != null ) {
				$updateFields['firstName'] = $this->input->post('firstName');
			}

			if( $this->input->post('lastName') != null ) {
				$updateFields['lastName'] = $this->input->post('lastName');
			}

			if( $this->input->post('email') != null ) {
				$updateFields['email'] = $this->input->post('email');
			}

			if( $this->input->post('phone') != null ) {
				$updateFields['phone'] = $this->input->post('phone');
			}

			$this->ActivityModel->updateActivityRecord( $activityId, $updateFields );

			$output['status'] = true;
			$output['activityId'] = $activityId;

			return $output;
		});
	}
	
	public function generateCsv()
	{
		$quizId = $this->input->post('quizId');
		header("Content-type: text/csv");
		header("Content-Disposition: attachment; filename=lead_export.csv");
		header("Pragma: no-cache");
		header("Expires: 0");
		echo $this->ActivityModel->generateCsv($quizId);
	}

}

/* End of file activity.php */
/* Location: ./application/controllers/activity.php */