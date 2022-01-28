sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller,
	BusyIndicator,
	JSONModel) {
		"use strict";

		return Controller.extend("busqembarcaciones.controller.Main", {

			/**
			 * ciclo de vida del controlador
			 */
			onInit: function () {
				//let oModel = new sap.ui.model.json.JSONModel();
				let oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.undefined;
				if(!oModel){   // para caso 
					oModel = this.getOwnerComponent()._getPropertiesToPropagate().oModels.DetalleMarea;
				}
				this.getView().setModel(oModel);
				oModel.setProperty("/searchEmbar",{});
			},

			/**
			 * eventos
			 * @param {*} oEvent 
			 */

			onSelectItem:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModel = oContext.getModel(),
				help = oModel.getProperty("/help")||{},
				oInput = oModel.getProperty("/input"),
				sId = oInput.getId();

				help.CDEMB = oContext.getProperty("CDEMB");
				help.CDEMP =  oContext.getProperty("CDEMP");
				help.MREMB = oContext.getProperty("MREMB");
				help.NMEMB = oContext.getProperty("NMEMB");
				help.WERKS = oContext.getProperty("WERKS");
				help.KUNNR = oContext.getProperty("KUNNR");
				help.NAME1 = oContext.getProperty("NAME1");
				help.INPRP = oContext.getProperty("INPRP");
				help.NRTRI = oContext.getProperty("NRTRI"); 
				
				oModel.setProperty(`/help`,help);

				// Modelo con nombre
				oModel.setProperty("/DatosGenerales/CDEMB",oContext.getProperty("CDEMB"));
				oModel.setProperty("/DatosGenerales/NAME1",oContext.getProperty("CDEMP"));
				oModel.setProperty("/DatosGenerales/CDEMP",oContext.getProperty("MREMB"));
				oModel.setProperty("/DatosGenerales/NAME1",oContext.getProperty("WERKS"));
				oModel.setProperty("/DatosGenerales/CDEMP",oContext.getProperty("KUNNR"));
				oModel.setProperty("/DatosGenerales/NAME1",oContext.getProperty("NAME1"));
				oModel.setProperty("/DatosGenerales/CDEMP",oContext.getProperty("INPRP"));
				oModel.setProperty("/DatosGenerales/NMEMB",oContext.getProperty("NMEMB"));

				oModel.setProperty("/EmbaItem",oContext.getObject());

				if(sId.split("_")[1] === "W"){
					oInput.setValue(help.WERKS)
				}else if(sId.split("_")[1] === "R"){
					oInput.setValue(help.CDEMB)
				}
				this.close(oModel);
			},

			onPressSearchEmbar:function(sPage){
				BusyIndicator.show(0);
				let oModel = this.getView().getModel(),
				oDataEmbar = oModel.getProperty("/searchEmbar"),
				oService={},
				aOptions=[],
				aOptions2=[];
	
				oService.PATH = "/api/embarcacion/ConsultarEmbarcacion/";
				oService.MODEL = "";
				oService.param = {
					option: [],
					option2: [],
					options: aOptions,
					options2: aOptions2,
					p_pag: sPage,
					p_user: "BUSQEMB"
				  }
				
				aOptions.push({
					cantidad: "20",
					control: "COMBOBOX",
					key: "ESEMB",
					valueHigh: "",
					valueLow: "O"
				});
				if(oDataEmbar["CDEMB"]){
					aOptions.push({
						cantidad: "20",
						control: "INPUT",
						key: "CDEMB",
						valueHigh: "",
						valueLow: oDataEmbar["CDEMB"]
					})
				}
				if(oDataEmbar["NMEMB"]){
					aOptions.push({
						cantidad: "20",
						control: "INPUT",
						key: "NMEMB",
						valueHigh: "",
						valueLow: oDataEmbar["NMEMB"]
					})
				}
				if(oDataEmbar["MREMB"]){
					aOptions.push({
						cantidad: "20",
						control: "INPUT",
						key: "MREMB",
						valueHigh: "",
						valueLow: oDataEmbar["MREMB"]
					})
				}
				if(oDataEmbar["INPRP"]){
					aOptions.push({
						cantidad: "20",
						control: "COMBOBOX",
						key: "INPRP",
						valueHigh: "",
						valueLow: oDataEmbar["INPRP"]
					})
				}
				if(oDataEmbar["STCD1"]){
					aOptions2.push({
						cantidad: "20",
						control: "INPUT",
						key: "STCD1",
						valueHigh: "",
						valueLow: oDataEmbar["STCD1"]
					})
				}
				if(oDataEmbar["NAME1"]){
					aOptions2.push({
						cantidad: "20",
						control: "INPUT",
						key: "NAME1",
						valueHigh: "",
						valueLow: oDataEmbar["NAME1"]
					})
				}
	
				this.getDataSearchHelp(oService);
	
			},

			onCleanSearh:function(oEvent){
				let oContext = oEvent.getSource().getBindingContext(),
				oModelMaster = oContext.getModel();
				oModelMaster.setProperty("/searchEmbar",{})
			},
	
			onUpdateTable:function(oEvent){
				let oTotal = oEvent.getParameter("total"),
				oActual = oEvent.getParameter("actual"),
				oModel =this.getView().getModel(),
				sPage,
				sTotalPag;
				if(oTotal>0){
					sPage = oModel.getProperty("/pageTable")["page"];
					sTotalPag = oModel.getProperty("/dataEmbarcaciones")["p_totalpag"];
					this.addPagination("HelpTable",sTotalPag,sPage);
				}
			},

			/**
			 * Metodos internos
			 * @param {*} oModel 
			 */

			close:function(oModel){
				let idDialog = oModel.getProperty("/idDialogComp"),
				oControl = sap.ui.getCore().byId(idDialog);
				oControl.close();
			},

			getDataSearchHelp:function(oService){
				let sUrl = this.getHostService() + oService.PATH,
				oModel = this.getView().getModel(),
				oDataUpdate=fetch(sUrl,{
					method:'POST',
					body:JSON.stringify(oService.param)
				});
				oDataUpdate.then(res=>res.json())
				 .then(data=>{
					oModel.setProperty("/dataEmbarcaciones",data);
					oModel.setProperty("/pageTable",{
						text:`Página ${oService.param.p_pag} de ${data.p_totalpag}`,
						page:oService.param.p_pag
					});
					 BusyIndicator.hide();
					// this.mFragments["NewMaster"].getControl().close();
					// this.getMessageDialog("Success",data.dsmin);
				 })
			},
			keyPress:function(oEvent){
				if(oEvent.mParameters.value!==""){
					this.onPressSearchEmbar();
				}
			},
	
			addPagination:function(idTable,sTotalPag,sPage){
				var oTable = this.getView().byId(idTable);
				var oContentHolder = oTable.getParent().getParent();
	
				this._destroyControl("selectPage");
	
				this._destroyControl("vbox1");
				var oVBox1 = new sap.m.VBox("vbox1", {
				});
	
				this._destroyControl("hbox1");
				var oHBox1 = new sap.m.HBox("hbox1", {
					justifyContent: "SpaceBetween",
					width: "100%"
				});
	
				this._destroyControl("hboxPagination");
				var oHBoxPagination = new sap.m.HBox("hboxPagination", {
					justifyContent: "Center",
					width: "75%"
				});
	
				oHBoxPagination.setWidth("");
				oHBox1.setJustifyContent("Center");
				oHBox1.addItem(oHBoxPagination);
				oVBox1.addItem(oHBox1);
				oContentHolder.addItem(oVBox1);
	
				this.generatePaginator(sTotalPag,sPage);
			},
	
			generatePaginator:function(sTotalPag,sPage){
				var countPerPage = 10;
	
				this.oPagination.container = sap.ui.getCore().byId("hboxPagination");
				this.oPagination.container.destroyItems();
				this.oPagination.init({
					size: parseInt(sTotalPag) ,
					page: parseInt(sPage)||1,
					step: 5,
					// table: oTablex,
					// countTable: countTable,
					countPerPage: countPerPage,
					// tableData: aDataTable,
					// devicePhone: this._devicePhone,
					// deviceTablet: this._deviceTablet
					controller:this
				});
			},
	
			oPagination: {
				container: {},
				init: function (properties) {
					this.Extend(properties);
					this.Start();
				},
	
				Extend: function (properties) {
					properties = properties || {};
					this.size = properties.size || 1;
					this.page = properties.page || 1;
					this.step = properties.step || 5;
					// this.table = properties.table || {};
					// this.countTable = properties.countTable || 0;
					this.countPerPage = properties.countPerPage || 10;
					// this.tableData = properties.tableData || 10;
					// this.devicePhone = properties.devicePhone;
					// this.deviceTablet = properties.deviceTablet;
					this.controller = properties.controller;
				},
	
				Start: function () {
					this.container.destroyItems();
					var oSelect = new sap.m.Select("selectPage", {
						change: this.SelectChange.bind(this),
					});
					this.container.addItem(oSelect);
	
					this.AddNumber(1, this.size + 1);
	
					this.setFixedButtons();
					var aSelectItems = oSelect.getItems();
	
					for (var k = 0; k < aSelectItems.length; k++) {
						var item = aSelectItems[k];
						var r = item.getText();
	
						if (r === this.page.toString()) {
							oSelect.setSelectedItem(item);
						}
					}
				},
	
				AddNumber: function (s, f) {
					for (var i = s; i < f; i++) {
						sap.ui.getCore().byId("selectPage").addItem(
							new sap.ui.core.Item({
								key: i,
								text: i
							})
						);
					}
				},
	
				AddFirstNumber: function () {
					sap.ui.getCore().byId("selectPage").insertItem(
						new sap.ui.core.Item({
							key: 1,
							text: 1
						}, 2)
					);
				},
				AddLastNumber: function () {
					sap.ui.getCore().byId("selectPage").insertItem(
						new sap.ui.core.Item({
							key: this.size,
							text: this.size
						}, this.size - 3)
					);
				},
				SelectChange: function (oEvent) {
					this.page = parseInt(oEvent.getParameters().selectedItem.getText());
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
				ClickNumber: function (oEvent) {
					this.page = parseInt(oEvent.getSource().getText());
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
	
				ClickPrev: function () {
					this.page--;
					if (this.page < 1) {
						this.page = 1;
					}
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
	
				ClickNext: function () {
					this.page++;
					if (this.page > this.size) {
						this.page = this.size;
					}
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
	
				ClickFirst: function () {
					this.page = 1;
					if (this.page < 1) {
						this.page = 1;
					}
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
	
				ClickLast: function () {
					this.page = this.size;
					if (this.page > this.size) {
						this.page = this.size;
					}
					this.Start();
					this.controller.onPressSearchEmbar(this.page)
				},
	
				setFixedButtons: function (e) {
					// if (this?.devicePhone || this?.deviceTablet) {
						var oButton = new sap.m.Button({
							icon: "sap-icon://close-command-field",
							type:"Transparent",
							press: this.ClickFirst.bind(this)
						});
						this.container.insertItem(oButton, 0);
	
						var oButton = new sap.m.Button({
							icon: "sap-icon://navigation-left-arrow",
							type:"Transparent",
							press: this.ClickPrev.bind(this)
						});
	
						this.container.insertItem(oButton, 1);
	
						oButton = new sap.m.Button({
							icon: "sap-icon://navigation-right-arrow",
							type:"Transparent",
							press: this.ClickNext.bind(this)
						});
						this.container.insertItem(oButton, this.size + 2);
	
						var oButton = new sap.m.Button({
							icon: "sap-icon://open-command-field",
							type:"Transparent",
							press: this.ClickLast.bind(this)
						});
						this.container.insertItem(oButton, this.size + 3);
					// }
					// else {
	
					// 	var oButton = new sap.m.Button({
					// 		text: "First",
					// 		press: this.ClickFirst.bind(this)
					// 	});
					// 	this.container.insertItem(oButton, 0);
	
					// 	oButton = new sap.m.Button({
					// 		text: "Next",
					// 		press: this.ClickNext.bind(this)
					// 	});
					// 	this.container.insertItem(oButton, 1);
	
					// 	oButton = new sap.m.Button({
					// 		text: "Previous",
					// 		press: this.ClickPrev.bind(this)
					// 	});
					// 	this.container.insertItem(oButton, this.size + 2);
	
					// 	oButton = new sap.m.Button({
					// 		text: "Last",
					// 		press: this.ClickLast.bind(this)
					// 	});
					// 	this.container.insertItem(oButton, this.size + 3);
					// }
				}
			},
			_destroyControl: function (id) {
				let oControl = this.getView().byId(id);
				if (oControl !== undefined) oControl.destroy();
	
				oControl = sap.ui.getCore().byId(id);
				if (oControl !== undefined) oControl.destroy();
			},

			/**
			 * 
			 * @returns url service 
			 */
			getHostService: function () {
				var urlIntance = window.location.origin,
				servicioNode ; 
	
				if (urlIntance.indexOf('tasaqas') !== -1) {
					servicioNode = 'qas'; // aputando a QAS
				} else if (urlIntance.indexOf('tasaprd') !== -1) {
					servicioNode = 'prd'; // apuntando a PRD
				}else if(urlIntance.indexOf('localhost') !== -1){
					servicioNode = 'cheerful-bat-js'; // apuntando a DEV
				}else{
					servicioNode = 'cheerful-bat-js'; // apuntando a DEV
				}
	
				return `https://cf-nodejs-${servicioNode}.cfapps.us10.hana.ondemand.com`;
			},
		});
	});