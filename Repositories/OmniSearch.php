<?php

namespace Leantime\Plugins\OmniSearch\Repositories;

use Leantime\Core\Db\Db as DbCore;
use PDO;

/**
 * OmniSearch Repository - Handles database queries relevant to OmniSearch.
 */
class OmniSearch
{
    /**
     * @var DbCore - Database connection.
     */
    private DbCore $db;

    /**
     * Constructor.
     *
     * @param DbCore $db Database connection instance.
     */
    public function __construct(DbCore $db)
    {
        $this->db = $db;
    }

    /**
     * Retrieves all comments grouped by module ID, concatenated with user names.
     *
     * @return array<int, string> An associative array where keys are module IDs and values are concatenated comments and user names.
     */
    public function getAllComments(): array
    {
        $sql = 'SELECT
                comments.moduleId,
                comments.text,
                users.firstName,
                users.lastName
            FROM zp_comment AS comments
            JOIN zp_user AS users ON comments.userId = users.id';

        $stmn = $this->db->database->prepare($sql);
        $stmn->execute();

        $comments = [];
        $results = $stmn->fetchAll(PDO::FETCH_ASSOC);
        $stmn->closeCursor();

        foreach ($results as $row) {
            $moduleId = $row['moduleId'];
            if (!isset($comments[$moduleId])) {
                $comments[$moduleId] = '';
            }

            // Concatenate the text and name
            $text = strip_tags(html_entity_decode($row['text'], ENT_QUOTES, 'UTF-8'));
            $name = $row['firstName'] . ' ' . $row['lastName'];
            $comments[$moduleId] .= $text . ' ' . $name . ' ';
        }

        // Trim extra spaces at the end
        foreach ($comments as $moduleId => $concatenatedComments) {
            $comments[$moduleId] = trim($concatenatedComments);
        }

        return $comments;
    }

    /**
     * Retrieves all unique timelog descriptions grouped by ticket ID.
     * Each description is split into unique words and then reconstructed as a string.
     *
     * @return array<int|string, string> An associative array where the keys are ticket IDs and the values are unique concatenated words from their respective timelog descriptions.
     */
    public function getAllTimelogDescriptions(): array
    {
        $sql = 'SELECT
            timesheets.ticketId,
            timesheets.description
        FROM zp_timesheets AS timesheets';

        $stmt = $this->db->database->prepare($sql);
        $stmt->execute();

        $timelogDescriptions = [];
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        foreach ($results as $row) {
            $ticketId = $row['ticketId'];
            if (!isset($timelogDescriptions[$ticketId])) {
                $timelogDescriptions[$ticketId] = [];
            }

            // Split the description into words and merge unique words
            $words = preg_split('/\s+/', $row['description']);
            $timelogDescriptions[$ticketId] = array_unique(array_merge($timelogDescriptions[$ticketId], $words));
        }

        // Convert arrays of words back to strings
        foreach ($timelogDescriptions as $ticketId => $wordsArray) {
            $timelogDescriptions[$ticketId] = implode(' ', $wordsArray);
        }

        return $timelogDescriptions;
    }
}
