<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ActivityModel extends CI_Model {

	public function getActivityByQuizId($quizId)
	{
		$this->db->select('*');
		$this->db->from('activity');
		$this->db->where('quizId', $quizId);

		$query = $this->db->get();

		return $query->result();
	}

	public function getActivityRecord($activityId)
	{
		$this->db->select('*');
		$this->db->from('activity');
		$this->db->where('activityId', $activityId);

		$query = $this->db->get();

		return $query->result();
	}
    
	public function addNewActivityRecord( $quizId )
	{
		$this->db->set('quizId', $quizId);

		$this->db->insert('activity');

		return $this->db->insert_id();
	}
    
	public function updateActivityRecord( $activityId, $updateFields )
	{
		$this->db->where('activityId', $activityId);
		$this->db->update('activity', $updateFields); 
	}

	public function generateCsv($quizId)
	{
		$this->load->dbutil();
		$query = $this->db->query("SELECT
				name as `Quiz Name`,
				activity.created as Date,
				firstName as `First Name`,
				lastName as `Last Name`,
				email as Email,
				phone as `Phone Number`,
				IF(quizCompleted,'Yes','No') as `Quiz Completed`,
				quizResult as `Quiz Result`,
				IF(ctaClicked,'Yes','No') as `Call-to-Action Clicked`,
				shareCount as `Share Count`
			FROM activity
			LEFT JOIN quizzes ON activity.quizId = quizzes.quizId
			WHERE activity.quizId = $quizId AND coalesce(firstName, lastName, email, phone) IS NOT NULL");
		return $this->dbutil->csv_from_result($query);
	}
}

/* End of file activity.php */
/* Location: ./application/models/activity.php */