<?php

namespace Visualization\Model;

use Zend\Db\TableGateway\TableGateway;

class SiteTable {

    protected $tableGateway;

    public function __construct(TableGateway $tableGateway) {
        $this->tableGateway = $tableGateway;
    }

    public function fetchAll() {
        $resultSet = $this->tableGateway->select();
        return $resultSet;
    }

    public function getSite($id) {
        $id = (int) $id;
        $rowset = $this->tableGateway->select(array('id' => $id));
    }

}
