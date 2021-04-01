/**
 * Created by wasib & gourav on 11/01/18.
 */
dataApprovalApp.directive('calendar', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attr, ngModel) {
            $(el).datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText) {
                    scope.$apply(function () {
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        }
    };
});
dataApprovalApp.controller('AuditReportController', function ($rootScope,
    $scope,
    $timeout,
    MetadataService) {

    $scope.programStages = [];
    document.getElementById("orgUnitTree").style.display="block";
    
    jQuery(document).ready(function () {
        hideLoad();
    })
    $timeout(function () {
        $scope.date = {};
        $scope.date.startDate = new Date();
        $scope.date.endDate = new Date();
    }, 0);

    //initially load tree
    selection.load();

    $timeout(function () {
        $('#loader').hide();
    }, 1000);

    // Listen for OU changes
    selection.setListenerFunction(function () {
        $scope.selectedOrgUnitUid = selection.getSelected();
        loadPrograms();
    }, false);

    loadPrograms = function () {
        MetadataService.getOrgUnit($scope.selectedOrgUnitUid).then(function (orgUnit) {
            $timeout(function () {
                $scope.selectedOrgUnit = orgUnit;
                $scope.allPrograms = orgUnit.programs;
                $scope.programs = [];
                $scope.programStages = [];
                for (var i = 0; i < orgUnit.programs.length; i++) {
                    for (var j = 0; j < orgUnit.programs[i].attributeValues.length; j++) {
                        if (orgUnit.programs[i].attributeValues[j].attribute.code === 'forapproval' && orgUnit.programs[i].attributeValues[j].value === 'true') {
                            $scope.isValidProgram = true;
                            $scope.programs.push(orgUnit.programs[i]);
                        }
                    }
                }
            });
        });
    }
    $scope.getProgramStages = function (progId) {
        $scope.selectedProgramID = progId.id;
        var url1 = "../../programs/" + progId.id + ".json?fields=id,name,withoutRegistration,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false";
        $.get(url1, function (data1) {
            $timeout(function () {
                $scope.programStages = [];
                for (var j = 0; j < data1.programStages.length; j++) {
                    $scope.programStages.push(data1.programStages[j]);
                }
            });
        });
    }
    $scope.getSelectedProgramStage = function (selectedProgramStage) {
        if (selectedProgramStage != null) {
            $scope.selectedPSName = [];
            $scope.selectedPSName.push(selectedProgramStage);
            $scope.selectedPSID = $scope.selectedPSName[0].id;
        }
    }

    $scope.updateStartDate = function (startdate) {
        $scope.startdateSelected = startdate;
        //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
    };

    $scope.updateEndDate = function (enddate) {
        $scope.enddateSelected = enddate;
        //  alert("$scope.enddateSelected---"+ $scope.enddateSelected);
    };

    $scope.fnExcelReport = function () {
        $("#tableid").tableExport({
            // formats: ["xlsx", "xls"],
            filename: "Audit Report"
        });
    };

    $scope.exportData = function (program) {
        //   exportData($scope.date.startDate,$scope.date.endDate,program,$scope.selectedOrgUnit);
        exportData($scope.startdateSelected, $scope.enddateSelected, program, $scope.selectedOrgUnit);

    }

    //MZhphvQXhCK
    $scope.sqlViewData = [];
    $.ajax({
        async: false,
        type: "GET",
        url: "../../sqlViews/Yt8jsiVPRer/data.json?skipPaging=true",
        success: function (data) {
            $scope.sqlViewData.push(data.listGrid);
        }
    });


    $scope.presubmitData = function (program) {
        $timeout(function () {
            $('#loader').show();
            $scope.generateReport(program);
        }, 1000);
    }

    $scope.generateReport = function (program) {
        $timeout(function () {
            $("#tableid").empty();
            $scope.program = program;
            var index = 1;

            var final = [];
            var devent = [];

            $.ajax({
                async: false,
                type: "GET",
                url: "../../trackedEntityInstances.json?ou=" + $scope.selectedOrgUnit.id + "&ouMode=DESCENDANTS&program=" + $scope.selectedProgramID + "&skipPaging=true",
                success: function (data) {
                    for (var i = 0; i < data.trackedEntityInstances.length; i++) {
                        var ttt = data.trackedEntityInstances[i].trackedEntityInstance;
                        $.ajax({
                            async: false,
                            type: "GET",
                            url: "../../events.json?trackedEntityInstance=" + ttt + "&programStage=" + $scope.selectedPSID + "&startDate=" + $scope.startdateSelected + "&endDate=" + $scope.enddateSelected + "&order=eventDate:DESC&skipPaging=true",
                            success: function (response) {
                                if (response.events.length != 0) {
                                    $scope.eventDV = response.events[0].dataValues;
                                    $scope.eventOrgUnitId = response.events[0].orgUnit;
                                    $scope.heirarchyLevel = getheirarchy($scope.eventOrgUnitId);
                                    $scope.getAttributes = getattribues(data.trackedEntityInstances[i]);
                                    $scope.pickcount = sqlviewcount(ttt);
                                    for (var a = 0; a < $scope.eventDV.length; a++) {
                                        if ($scope.eventDV[a].dataElement == 'OZUfNtngt0T' || $scope.eventDV[a].dataElement == 'CCNnr8s3rgE') {

                                            if ($scope.eventDV[a].dataElement === 'OZUfNtngt0T') {
                                                $scope.currentStatus = $scope.eventDV[a].value;
                                                $scope.lastUpdated1 = $scope.eventDV[a].lastUpdated;
                                                $scope.lastUpdated = $scope.lastUpdated1.split("T")[0];
                                                $scope.approvedRejectedby = $scope.eventDV[a].storedBy;
                                            }
                                            if ($scope.eventDV[a].dataElement === 'CCNnr8s3rgE') {
                                                $scope.reasonForrejection = $scope.eventDV[a].value;
                                            }

                                        }
                                    }

                                    if ($scope.currentStatus == undefined || $scope.currentStatus == "") {
                                    }
                                    else {
                                        if ($scope.pickcount == undefined) {
                                            $scope.pickcount = "";
                                        }
                                        if ($scope.reasonForrejection == undefined) {
                                            $scope.reasonForrejection = "";
                                        }
                                        final.push({ heirarchyLevel: $scope.heirarchyLevel, Name: $scope.getAttributes.name, contact: $scope.getAttributes.contactNumber, count: $scope.pickcount, currentStatus: $scope.currentStatus, lastUpdated: $scope.lastUpdated, modifiedBy: $scope.approvedRejectedby, reason: $scope.reasonForrejection });
                                        $scope.reasonForrejection = ""; $scope.getAttributes.contactNumber = ""; $scope.getAttributes.name = ""; $scope.approvedRejectedby = ""; $scope.lastUpdated = ""; $scope.currentStatus = ""; $scope.pickcount = "";
                                    }
                                }
                            }
                        });
                    }
                    console.log(final);
                }
            });

            if (final.length == 0) {
                var row2 = $(
                    "<tr style='text-align: left;' ><td colspan='1' style='font-size: 20px;background-color: white; height:100px ;color: black;font-weight: bold '>No Data Found</td></tr>");
                $("#tableid").append(row2);

            }
            else {

                var rowm = $(
                    "<tr style='width:200px'><th colspan='9' style='border:1px solid black;background-color: #aeb0b0;height:30px;width:100px;color: white;text-align:center;font-weight: bold'>" + $scope.program.name + "</th></tr>" +
                    "<tr><th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold;position: relative;' >S.no." + "&nbsp;&nbsp;&nbsp;<span style='color: #1B4F72;margin-top: -15px;text-align: right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold;position: relative;' >Org Unit Path" + "&nbsp;&nbsp;&nbsp;<span style='color: #1B4F72;margin-top: -15px;text-align: right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold;position: relative;' >Name of Fee for Service specialist" + "&nbsp;&nbsp;&nbsp;<span style='color: #1B4F72;margin-top: -15px;text-align: right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold;position: relative;' >Contact Number" + "&nbsp;&nbsp;&nbsp;<span style='color: #1B4F72;margin-top: -15px;text-align: right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold;position: relative;' >Last Updated" + "&nbsp;&nbsp;&nbsp;<span style='color: #1B4F72;margin-top: -15px;text-align: right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold ' >No of times Rejected" + "&nbsp;&nbsp;&nbsp;<span  style='color: #1B4F72;margin-top: -15px;text-align:right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold ' >Current Status" + "&nbsp;&nbsp;&nbsp;<span style='color:  #1B4F72;margin-top: -15px;text-align:right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold ' >Approved/Rejected By" + "&nbsp;&nbsp;&nbsp;<span style='color:  #1B4F72;margin-top: -15px;text-align:right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "<th colspan='1' style='border:1px solid black;background-color: #aeb0b0;height:30px   ;color: white;text-align: center;font-weight: bold ' >Reason of rejection" + "&nbsp;&nbsp;&nbsp;<span style='color:  #1B4F72;margin-top: -15px;text-align:right;text-decoration: none;font-weight: normal;'></span></th>" +
                    "</tr>"
                );
                $("#tableid").append(rowm);

                for (var j = 0; j < final.length; j++) {

                    var rowf = $(
                        "<tr style='width:200px'><td  style='border:1px solid black;'> " + index +
                        "</td><td  style='border:1px solid black;'> " + final[j].heirarchyLevel +
                        "</td><td  style='border:1px solid black;'> " + final[j].Name +
                        "</td><td  style='border:1px solid black;'> " + final[j].contact +
                        "</td><td  style='border:1px solid black;'> " + final[j].lastUpdated +
                        "</td><td  style='border:1px solid black;'> " + final[j].count +
                        "</td><td  style='border:1px solid black;'> " + final[j].currentStatus +
                        "</td><td  style='border:1px solid black;'>" + final[j].modifiedBy +
                        "</td><td  style='border:1px solid black;'>" + final[j].reason +
                        "</td></tr>");
                    $("#tableid").append(rowf);
                    index++;
                }
            }
            $('#loader').hide();
        })
        $scope.show = true;
    };

    sqlviewcount = function (tei) {
        for (var m = 0; m < $scope.sqlViewData.length; m++) {
            for (var n = 0; n < $scope.sqlViewData[m].rows.length; n++) {
                if (tei === $scope.sqlViewData[n][0]) {
                    var count = $scope.sqlViewData[n][1];
                }
            }
        }
        return count;
    }

    getattribues = function (teilength) {
        for (var z = 0; z < teilength.attributes.length; z++) {
            if (teilength.attributes[z].displayName == 'Name of Fee for Service specialist') {
                $scope.name = teilength.attributes[z].value;
            }
            if (teilength.attributes[z].displayName == 'Contact number') {
                $scope.contactNumber = teilength.attributes[z].value;
            }
        }

        return {
            name: $scope.name,
            contactNumber: $scope.contactNumber
        };
    }

    getheirarchy = function (org) {
        $scope.hierarchy = "";
        var myMap = [];
        var parent = ""

        $.ajax({
            async: false,
            type: "GET",
            url: "../../organisationUnits/" + org + ".json?fields=name,level,parent[name,level,parent[id,name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level]",
            success: function (data) {
                if (data.level == 2) {
                    myMap.push(data.name);
                    myMap.push(data.parent.name)
                }
                if (data.level == 3) {
                    myMap.push(data.name);
                    myMap.push(data.parent.name)
                    myMap.push(data.parent.parent.name)
                }
                if (data.level == 4) {
                    myMap.push(data.name);
                    myMap.push(data.parent.name)
                    myMap.push(data.parent.parent.name)
                    myMap.push(data.parent.parent.parent.name)
                }
                if (data.level == 5) {
                    myMap.push(data.name);
                    myMap.push(data.parent.name)
                    myMap.push(data.parent.parent.name)
                    myMap.push(data.parent.parent.parent.name)
                    myMap.push(data.parent.parent.parent.parent.name)
                }
                if (data.level == 6) {
                    myMap.push(data.name);
                    myMap.push(data.parent.name)
                    myMap.push(data.parent.parent.name)
                    myMap.push(data.parent.parent.parent.name)
                    myMap.push(data.parent.parent.parent.parent.name)
                    myMap.push(data.parent.parent.parent.parent.parent.name)
                }
                // $scope.programs.push({name:"",id:""});
            }
        });

        for (var i = myMap.length - 1; i >= 0; i--) {
            $scope.hierarchy += myMap[i] + "/";
        }

        return $scope.hierarchy;
    }


    $scope.exportExcel = function () {
        var a = document.createElement('a');
        var data_type = 'data:application/vnd.ms-excel';
        var table_div = document.getElementById('tableid');
        var table_html = table_div.outerHTML.replace(/ /g, '%20');
        a.href = data_type + ', ' + table_html;
        a.download = 'Audit Report.xls';
        a.click();
    }

    function showLoad() {// alert( "inside showload method 1" );
        setTimeout(function () {
        }, 1000);

        //     alert( "inside showload method 2" );
    }
    function hideLoad() {

    }

});
