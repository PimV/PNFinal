<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use HighRoller\LineChart;
use HighRoller\SeriesData;

class IndexController extends AbstractActionController {

    public function indexAction() {
        //Line Chart
        $lineChart = new LineChart();
        $lineChart->title->text = 'Line Chart';

        $series = new SeriesData();
        $series->name = 'myData';

        $chartData = array(5324, 7534, 6234, 7234, 8251, 10324);
        foreach ($chartData as $value)
            $series->addData($value);

        $lineChart->addSeries($series);

        //Pie Chart
        $pieChart = new \HighRoller\PieChart();
        $pieChart->title->text = 'Pie Chart';

        $series2 = new SeriesData();
        $series2->name = 'myData';

        $chartData = array_reverse($chartData);
        foreach ($chartData as $value)
            $series2->addData($value);

        $pieChart->addSeries($series2);

        $barChart = new \HighRoller\ColumnChart();
        $barChart->title->text = 'Column Chart';

        $series3 = new SeriesData();
        $series3->name = 'myData';

        shuffle($chartData);
        foreach ($chartData as $value)
            $series3->addData($value);

        $barChart->addSeries($series3);


        return new ViewModel(array(
            'highroller' => $lineChart,
            'highroller2' => $pieChart,
            'highroller3' => $barChart
        ));
    }

}
