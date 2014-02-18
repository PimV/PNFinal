var w = 160,
        h = 95,
        p = 20,
        x = d3.time.scale().domain([new Date(2011, 1, 1, 0), new Date(2011, 1, 1, 23)]).range([15, w]),
        y = d3.scale.linear().domain([0, 1]).range([h, 20]),
        hourformat = d3.time.format("%I %p");
;
var area = d3.svg.area()
        .x(function(d) {
            return x(d.x);
        })
        .y0(h - 1)
        .y1(function(d) {
            return y(d.y);
        });

var areaClasses = {"Sleeping": "sleeping", "Eating and drinking": "eating", "Family care": "care", "Shopping": "shopping", "Household activities": "household", "Education": "education", "Watching television": "television", "Socializing": "socializing", "Leisure and sports": "leisure", "Volunteering": "volunteering", "Working": "working", "Religious activities": "religious", "Correspondence": "correspondence", "Sports and recreation": "sports", "Professional and personal care": "procare"};

var activities,
        areaClass,
        demogData = [],
        currData = [];
function loadGraphs(group) {
    currDemog = group;
    d3.text('files/timeuse-allCopy.csv', 'text/csv', function(text) {
        activities = d3.csv.parseRows(text);
        for (i = 1; i < activities.length; i++) {
            if (currDemog !== activities[i][0]) {
                demogData.push(currData);
                currData = [];
            }
            currDemog = activities[i][0];

            if (activities[i][1] in areaClasses)
                areaClass = areaClasses[ activities[i][1] ];
            else
                areaClass = "area";

            var justhours = activities[i].slice(2, 26);
            var adata = justhours.map(function(y, i) {
                return {x: new Date(2011, 1, 1, i), y: y};
            });





            for (j = 0; j < adata.length; j++) {
                adata[j].y = parseFloat(adata[j].y) / 100;
            }
            currData.push(adata);

            if (currDemog == group) {
                var vis = d3.select("#vis")
                        .append("div")
                        .attr("class", function() {
                            if (i == 1 || i == 5 || i == 9)
                                return "chart noborder";
                            else if (i == 4 || i == 8 || i == 12)
                                return "chart endrow";
                            else
                                return "chart";
                        })

                        .append("svg:svg")
                        .attr("width", w + p * 2)
                        .attr("height", h + p * 2)
                        .append("svg:g")
                        .attr("transform", "translate(" + p + "," + p + ")");


                var rules = vis.selectAll("g.rule")
                        .data(x.ticks(d3.time.hours, 12))
                        .enter().append("svg:g")
                        .attr("class", "rule");

                rules.append("svg:line")
                        .attr("x1", x)
                        .attr("x2", x)
                        .attr("y1", 20)
                        .attr("y2", h - 1);

                rules.append("svg:line")
                        .attr("class", "axis")
                        .attr("y1", h)
                        .attr("y2", h)
                        .attr("x1", -20)
                        .attr("x2", w + 1);

                vis.append("svg:text")
                        .attr("x", -18)
                        .text(activities[i][1])
                        .attr("class", "aheader");

                rules.append("svg:text")
                        .attr("class", "ticklabel")
                        .attr("y", h)
                        .attr("x", x)
                        .attr("dx", 8)
                        .attr("dy", 11)
                        .attr("text-anchor", "middle")
                        .text(hourformat);

                vis.append("svg:text")
                        .attr("x", -12)
                        .attr("y", h - 4)
                        .text("5")
                        .attr("text-anchor", "right")
                        .attr("class", "ticklabel");

                vis.append("svg:text")
                        .attr("x", -18)
                        .attr("y", 20)
                        .text("10k")
                        .attr("text-anchor", "right")
                        .attr("class", "ticklabel");


                vis.append("svg:path")
                        .data([adata])
                        .attr("class", areaClass)
                        .attr("d", area);
            } // @end if everyone

        } // @end for loop

        demogData.push(currData);

    }); // @end text
}
loadGraphs("everyone");



function transition(index) {
    var dataselect = demogData[index];

    d3.selectAll("path").each(function(d, i) {
        d3.select(this)
                .data([dataselect[i]])
                .transition()
                .duration(500)
                .attr("d", area);
    });
}

var explain = {
};
$("#filters a").click(function() {
    $("#filters a").removeClass("current");
    $(this).addClass("current");

    var demog = $(this).text();
    var demogid = $(this).attr("id");

    $("#explain h3").text(demog);
    $("#explain p").html(explain[demogid]);
});