/**
 * Created by wasib & gourav on 31/12/17.
 */

var trackerReportsAppServices = angular.module('trackerReportsAppServices', [])
    .service('MetadataService', function ($http, $q) {
        return {
            getOrgUnit: function (id) {
                var def = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    url: '../../organisationUnits/' + id + ".json?fields=id,name,programs[id,name,withoutRegistration,attributeValues[attribute[id,code],value],programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]]],sortOrder]]]&paging=false",
                    success: function (data) {
                        def.resolve(data);
                    }
                });
                return def;
            },
            getAllPrograms: function () {
                var def = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    url: '../../programs.json?fields=id,name,withoutRegistration,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false',
                    success: function (data) {
                        def.resolve(data);
                    }
                });
                return def;
            },
            getProgramStages: function (progId) {
                var def = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    url: '../../programs/' + progId + ".json?fields=id,name,withoutRegistration,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false",
                    success: function (data) {
                        def.resolve(data);
                    }
                });
                return def;
            },
            getSQLView: function (sqlViewUID, param) {
                var def = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    url: '../../sqlViews/' + sqlViewUID + "/data?" + param,
                    success: function (data) {
                        def.resolve(data);
                    }
                });
                return def;
            },

            getALLAttributes: function () {
                var def = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    url: '../../trackedEntityAttributes.json?fields=id,name,attributeValues[*,attribute[id,name,code]]&paging=false',
                    success: function (data) {
                        def.resolve(data);
                    }
                });
                return def;
            },

            getEventsWithoutFilter: function(selectedOrgUnit,selectedProgram,selectedProgramStage){
                var def = $q.defer();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    async: false,
                    contentType: "application/json",
                    url:"../../events.json?orgUnit=" + selectedOrgUnit + "&ouMode=DESCENDANTS&program=" + selectedProgram + "&programStage=" + selectedProgramStage + "&eventStatus=COMPLETED&skipPaging=true",
                    success: function (data) {
                    def.resolve(data);
                    }
                });
                return def.promise;
            },
            
            getEventsWithFilter: function(selectedOrgUnit,selectedProgram,selectedProgramStage,startdateSelected,enddateSelected){
                var def = $q.defer();
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    async: false,
                    contentType: "application/json",
                    url:"../../events.json?orgUnit=" + selectedOrgUnit + "&ouMode=DESCENDANTS&program=" + selectedProgram + "&programStage=" + selectedProgramStage+ "&eventStatus=COMPLETED&startDate=" + startdateSelected + "&endDate=" + enddateSelected + "&skipPaging=true",
                    success: function (data) {
                    def.resolve(data);
                    }
                });
                return def.promise;
            }
        }
    });