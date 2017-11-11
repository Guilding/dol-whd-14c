'use strict';

import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import find from 'lodash/find';

module.exports = function(ngModule) {
  ngModule.controller('sectionWorkSitesController', function(
    $scope,
    $location,
    navService,
    responsesService,
    stateService,
    validationService,
    _constants
  ) {
    'ngInject';
    'use strict';

    $scope.formData = stateService.formData;
    $scope.validate = validationService.getValidationErrors;

    if (!$scope.formData.workSites) {
      $scope.formData.workSites = [];
    }

    let query = $location.search();

    var vm = this;
    vm.activeTab = query.t ? query.t : 1;
    vm.activeWorksite = {};
    vm.activeWorksiteIndex = -1;
    vm.activeWorker = {};
    vm.activeWorkerIndex = -1;
    vm.columns = [
    {
        "className": 'edit-table-entry',
        "orderable": false,
        "data":null,
        "defaultContent": ''
    },
    {
        "className": 'delete-table-entry',
        "orderable": false,
        "data":null,
        "defaultContent": ''
    },
    { title: 'Name' },
    { title: 'Type of work performed' },
    { title: 'Primary disability' },
    { title: 'How many jobs did this worker perform at this work site?' },
    { title: 'Average # of hours worked per week on all jobs at this work site' },
    { title: 'Average earnings per hour for all jobs at this work site' },
    { title: 'Prevailing wage rate for job described above' },
    { title: 'Productivity measure/rating for job described above' },
    { title: 'Commensurate wage rate/average earnings per hour for job described above' },
    { title: 'Total hours worked for job described above' },
    { title: 'Does worker perform work for this employer at any other work site?' }
    ]

    // multiple choice responses
    let questionKeys = ['WorkSiteType', 'PrimaryDisability'];
    responsesService.getQuestionResponses(questionKeys).then(responses => {
      $scope.responses = responses;
    });

    this.clearActiveWorker = function() {
      vm.activeWorker = {};
      vm.activeWorkerIndex = -1;
    };

    this.addEmployee = function() {
      if (!vm.activeWorksite || isEmpty(vm.activeWorker)) {
        return;
      }

      if (!vm.activeWorksite.employees) {
        vm.activeWorksite.employees = [];
      }

      if (vm.activeWorkerIndex > -1) {
        vm.activeWorksite.employees[vm.activeWorkerIndex] = vm.activeWorker;
      } else {
        vm.activeWorksite.employees.push(vm.activeWorker);
      }

      vm.clearActiveWorker();
    };

    this.addAnotherEmployee = function() {
      vm.addEmployee();
    };

    this.doneAddingEmployees = function() {
      vm.addEmployee();
      vm.addingEmployee = false;
    };

    this.editEmployee = function(index) {
      if (vm.activeWorksite && vm.activeWorksite.employees.length > index) {
        vm.activeWorkerIndex = index;
        vm.activeWorker = merge({}, vm.activeWorksite.employees[index]);
        vm.addingEmployee = true;
      }
    };

    this.deleteEmployee = function(index) {
      if (vm.activeWorksite && vm.activeWorksite.employees.length > index) {
        vm.activeWorksite.employees.splice(index, 1);
      }
    };

    this.clearActiveWorkSite = function() {
      vm.activeWorksite = {};
      vm.activeWorksiteIndex = -1;
    };

    this.addWorkSite = function() {
      vm.addingWorkSite = true;
      vm.setActiveTab(1);
    };

    this.saveWorkSite = function() {
      if (!isEmpty(vm.activeWorksite)) {
        if (vm.activeWorksiteIndex > -1) {
          $scope.formData.workSites[vm.activeWorksiteIndex] = vm.activeWorksite;
        } else {
          $scope.formData.workSites.push(vm.activeWorksite);
        }
      }

      vm.clearActiveWorker();
      vm.clearActiveWorkSite();
      vm.addingWorkSite = false;
    };

    this.editWorkSite = function(index) {
      if ($scope.formData.workSites.length > index) {
        vm.activeWorksiteIndex = index;
        vm.activeWorksite = merge({}, $scope.formData.workSites[index]);
        vm.addingWorkSite = true;
        vm.setActiveTab(1);
      }
    };

    this.deleteWorkSite = function(index) {
      if ($scope.formData.workSites.length > index) {
        $scope.formData.workSites.splice(index, 1);
      }
    };

    this.setActiveTab = function(tab) {
      if (!vm.addingWorkSite || tab < 1 || tab > 2) {
        return;
      }

      vm.activeTab = tab;

      if (tab === 1 && vm.notInitialApp()) {
        navService.setNextQuery(
          { t: 2 },
          'Next: Add Employee(s)',
          'worksite_tab_box'
        );
        navService.setBackQuery({ doCancel: true }, 'Cancel');
      } else {
        navService.setNextQuery(
          { doSave: true },
          'Save Work Site & Employee(s)'
        );
        navService.setBackQuery({ doCancel: true }, 'Cancel');
      }
    };

    this.siteRowClicked = function(e) {
      let row = $(e.target).closest('.expanding-row');
      row.toggleClass('expanded');
      row.next().toggleClass('show');
    };

    this.getDisabilityDisplay = function(employee) {
      if (!employee) {
        return undefined;
      }

      var disability = find($scope.responses.PrimaryDisability, {
        id: employee.primaryDisabilityId
      });
      if (disability) {
        if (disability.otherValueKey) {
          return employee[disability.otherValueKey];
        } else {
          return disability.display;
        }
      }

      return undefined;
    };

    this.workerProductivityChanged = function(study) {
      if (!study && vm.activeWorker) {
        vm.activeWorker.productivityMeasure = undefined;
      }
    };

    // convenience methods to avoid lenghty template statements
    this.validateActiveWorksiteProperty = function(prop) {
      if (!prop || this.activeWorksiteIndex < 0) {
        return undefined;
      }

      return validationService.getValidationErrors(
        'workSites[' + this.activeWorksiteIndex + '].' + prop
      );
    };

    this.validateActiveWorkerProperty = function(prop) {
      if (!prop || this.activeWorksiteIndex < 0 || this.activeWorkerIndex < 0) {
        return undefined;
      }

      return validationService.getValidationErrors(
        'workSites[' +
          this.activeWorksiteIndex +
          '].employees[' +
          this.activeWorkerIndex +
          '].' +
          prop
      );
    };

    this.validateActiveWorksiteWorker = function(index) {
      if (this.activeWorksiteIndex < 0 || index < 0) {
        return undefined;
      }

      return validationService.getValidationErrors(
        'workSites[' + this.activeWorksiteIndex + '].employees[' + index + ']'
      );
    };

    this.notInitialApp = function() {
      return (
        $scope.formData.applicationTypeId !==
        _constants.responses.applicationType.initial
      );
    };

    $scope.$on('$routeUpdate', function() {
      query = $location.search();
      if (query.t) {
        vm.setActiveTab(query.t);
      }

      if (query.doSave) {
        vm.saveWorkSite();
        navService.clearQuery();
      }

      if (query.doCancel) {
        vm.clearActiveWorker();
        vm.clearActiveWorkSite();
        vm.addingWorkSite = false;
        navService.clearQuery();
      }
    });
  });
};
