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
dataApprovalApp.controller('ApprovedListController', function ($rootScope,
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

        //   var blob = new Blob([document.getElementById('divId').innerHTML], {
        //        type: 'text/plain;charset=utf-8'
        //      });
        //        saveAs(blob, "Report.xls");
        $("#divId").tableExport({
            formats: ["xlsx", "xls"],
            filename: "Report"
        });
    };

    $scope.exportData = function (program) {
        //   exportData($scope.date.startDate,$scope.date.endDate,program,$scope.selectedOrgUnit);
        exportData($scope.startdateSelected, $scope.enddateSelected, program, $scope.selectedOrgUnit);

    }

    $scope.presubmitData = function (program) {
        $timeout(function () {
            $('#loader').show();
            $scope.generateReport(program);
        }, 1000);
    }

    $scope.generateReport = function (program) {
        $timeout(function () {
            $scope.program = program;

            for (var i = 0; i < $scope.program.programTrackedEntityAttributes.length; i++) {
                var str = $scope.program.programTrackedEntityAttributes[i].displayName;
                var n = str.lastIndexOf('-');
                $scope.program.programTrackedEntityAttributes[i].displayName = str.substring(n + 1);

            }
            $scope.psDEs = [];
            $scope.Options = [];
            $scope.attribute = "Attributes";
            $scope.attributeValues = [''];
            $scope.numberOfEvents = [];
            $scope.attribute1 = "Name of Fee for Service specialist";
            $scope.approved_reject = "Approved/Rejected";
            $scope.event_date = "Event Date";
            var options = [];
            $scope.eventDataValues = [];
            $scope.valuesToDisplay = [];
            $scope.Events = [];
            $scope.selectedPS = $scope.selectedPSName;
            var index = 0;
            for (var i = 0; i < $scope.selectedPS.length; i++) {

                var psuid = $scope.selectedPS[i].id;
                $scope.psDEs.push({ dataElement: { id: "orgUnit", name: "orgUnit", ps: psuid } });

                for (var j = 0; j < $scope.selectedPS[i].programStageDataElements.length; j++) {

                    $scope.selectedPS[i].programStageDataElements[j].dataElement.ps = psuid;
                    var de = $scope.selectedPS[i].programStageDataElements[j];
                    $scope.psDEs.push(de);
                }
            }

            if ($scope.selectedOrgUnit.id === 'SpddBmmfvPr' || $scope.selectedOrgUnit.id === 'v8EzhiynNtf') {
                alert("Please select Org Unit from below levels ");
                $('#loader').hide();
            } else {
                MetadataService.getEventsWithFilter($scope.selectedOrgUnit.id, $scope.selectedProgramID, $scope.selectedPSID, $scope.startdateSelected, $scope.enddateSelected).then(function (response) {

                    $scope.existingEvents = [];
                    //  while(response.events){
                    $scope.numberOfEvents.push(response.events.length);

                    for (var j = 0; j < response.events.length; j++) {
                        $scope.tei = response.events[j].trackedEntityInstance;
                        $scope.eventId = response.events[j].event;
                        $scope.eventDV = response.events[j].dataValues;
                        $scope.eventOrgUnit = response.events[j].orgUnitName;
                        $scope.eventOrgUnitId = response.events[j].orgUnit;
                        var heirarchyLevel = getheirarchy($scope.eventOrgUnitId);
                        for (var a = 0; a < $scope.eventDV.length; a++) {
                            if ($scope.eventDV[a].value == 'Approved' || $scope.eventDV[a].value == 'Auto-Approved') {

                                if ($scope.eventDV[a].value == 'Approved') {
                                    $scope.colorName = "rgb(106, 199, 106)";
                                }
                                else if ($scope.eventDV[a].value == 'Auto-Approved') {
                                    $scope.colorName = "#f1ee9f";
                                }

                                if (response.events[j].eventDate) {
                                    $scope.event_Date1 = response.events[j].eventDate;
                                    $scope.event_Date = $scope.event_Date1.split("T")[0];
                                }

                                if ($scope.eventDV.length != 0) {
                                    for (var z = 1; z < $scope.psDEs.length; z++) {
                                        $scope.eventDataValues.push(eventLoop($scope.psDEs[z].dataElement.id));
                                    }
                                }
                                else {
                                    for (var z = 1; z < $scope.psDEs.length; z++) {
                                        $scope.eventDataValues.push("");
                                    }
                                }

                                function eventLoop(idHeader) {
                                    var event_Values = '';
                                    for (var y = 0; y < $scope.eventDV.length; y++) {
                                        if (idHeader == $scope.eventDV[y].dataElement) {
                                            event_Values = $scope.eventDV[y].value;
                                        }

                                    }
                                    return event_Values;
                                }

                                $.ajax({
                                    async: false,
                                    type: "GET",
                                    url: "../../trackedEntityInstances/" + $scope.tei + ".json?fields=trackedEntityInstance,orgUnit,created,attributes[attribute,displayName,value]&ou=" + $scope.selectedOrgUnit.id + "&ouMode=DESCENDANTSprogram=" + $scope.selectedProgramID + "&programStage=" + $scope.selectedPSID + "&startDate=" + $scope.startdateSelected + "&endDate=" + $scope.enddateSelected + "&skipPaging=true",
                                    success: function (response1) {
                                        $scope.enrollmentDate1 = response1.created;
                                        $scope.enrollmentDate = $scope.enrollmentDate1.split(" ")[0];
                                        for (var k = 0; k < response1.attributes.length; k++) {
                                            if (response1.attributes[k].displayName == 'Name of Fee for Service specialist') {
                                                $scope.attributeValues[0] = response1.attributes[k].value;
                                            }
                                        }
                                    }
                                })

                                var displayingValues = {
                                    currentProgram: $scope.program,
                                    attributeValues0: $scope.attributeValues[0],
                                    eventOrgUnitName: heirarchyLevel,
                                    eventDate: $scope.event_Date,
                                    allEventDataValues: $scope.eventDataValues,
                                    eventId: $scope.eventId,
                                    color: $scope.colorName
                                }
                                $scope.valuesToDisplay.push(displayingValues);
                                console.log($scope.valuesToDisplay);
                                $scope.program = '';
                                $scope.attributeValues[0] = '';
                                $scope.eventOrgUnit = '';
                                $scope.event_Date = '';
                                $scope.eventDataValues = [];
                                $scope.eventId = '';
                                $scope.colorName = '';

                            }
                        }
                        //   }
                    }
                })
                $('#loader').hide();
            }
        });
        $scope.show = true;
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
        a.download = 'Approved List.xls';
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
