sap.ui.define([
	"whatever/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"./utilities"
], function(baseController, jsonModel, utilities) {
	"use strict";
	console.log("Inside app.controller.js");

	return baseController.extend("whatever.controller.App", {

	    onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new jsonModel({
				busy: true,
				delay: 0,
				itemToSelect: null,
				addEnabled: false

			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().getModel().metadataLoaded()
				.then(fnSetAppNotBusy);

			// Makes sure that master view is hidden in split app
			// after a new list entry has been selected.
			oListSelector.attachListSelectionChange(function() {
				this.byId("idAppControl").hideMaster();
			}, this);

			// apply content density mode to root view
		//	this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this.getView().addStyleClass(utilities.getContentDensityClass());
			this._oAppControl = this.byId("content");
		}
	});

});
