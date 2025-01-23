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
     * getAllComments - Retrieves all comments from the database with module ID as key and includes user details.
     *
     * @return array<string, array<array<string, mixed>>> An associative array where keys are module IDs and values are arrays of comments.
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
