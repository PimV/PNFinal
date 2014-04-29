<?php

namespace Visualization\Model;

use Zend\Db\Sql\Sql;
use Zend\Db\Sql\Where;
use Zend\Db\ResultSet\ResultSet;

class Report {

    protected $adapter;
    protected $site_id;
    protected $site_title;
    protected $google_keys;
    protected $isValid = true;

    public function __construct($adapter, $id = null) {
        $this->adapter = $adapter;
        if ($id == null) {
            //Wait, what? How could this ID be 0/null?!
            $this->isValid = false;
        }
        $this->site_id = $id;

        $this->setSiteTitle($id);

        $sql = new Sql($this->adapter);
        $select = $sql->select();
        $select->from('site_reporting');
        $select->where(array('site_id' => $id));

        $statement = $sql->prepareStatementForSqlObject($select);
        $result = $statement->execute();
        $resultSet = new ResultSet();
        $results = $resultSet->initialize($result)->toArray();

        if (count($results) > 0) {
            $this->setReportingKeys($results);
        }
    }

    public function setSiteTitle($id) {
        $sql = new Sql($this->adapter);
        $select = $sql->select();
        $select->from('site');
        $select->where(array('id' => $id));

        $statement = $sql->prepareStatementForSqlObject($select);
        $result = $statement->execute();
        $resultSet = new ResultSet();
        $results = $resultSet->initialize($result)->toArray();

        if (count($results) > 0) {
            $this->site_title = $results[0]['title'];
        } else {
            $this->isValid = false;
        }
    }

    public function setReportingKeys($raw_results) {
        $sql = new Sql($this->adapter);
        $select = $sql->select();
        $select->from('reporting');

        $where = new Where();
        foreach ($raw_results as $raw_result) {
            $where->equalTo('id', $raw_result['reporting_id'])->OR;
        }
        $select->where($where);

        $statement = $sql->prepareStatementForSqlObject($select);
        $result = $statement->execute();
        $resultSet = new ResultSet();
        $results = $resultSet->initialize($result)->toArray();

        foreach ($results as $result) {
            $this->google_keys[] = $result['spreadsheet_key'];
        }
    }

    public function getReportingKeys() {
        return $this->google_keys;
    }

    public function getSiteTitle() {
        return $this->site_title;
    }

    public function isReportValid() {
        return $this->isValid;
    }

}
