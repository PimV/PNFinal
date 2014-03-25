<?php

namespace Visualization\Model;

use Zend\Db\Sql\Sql;
use Zend\Db\Sql\Where;
use Zend\Db\ResultSet\ResultSet;

class Report {

    protected $adapter;
    protected $google_keys;

    function __construct($adapter, $id = null) {
        $this->adapter = $adapter;
        if ($id == null) {
            //Wait, what? How could this ID be 0?!
        }
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

    function setReportingKeys($raw_results) {
        //Clear keys
        $google_keys = array();

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

    function getReportingKeys() {
        return $this->google_keys;
    }

}
