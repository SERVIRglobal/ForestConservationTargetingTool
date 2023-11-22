//Forest conservation targeting tool V1.3

//---------------------------------           PRELUDE             -----------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------	
//https://skalman.github.io/UglifyJS-online/	
		
		if (typeof phpVarUserName == 'undefined') {
			var phpVarUserName = "notloggedin";
			var phpVarlayerPIN = "notloggedin";
		}
	
        Ext.BLANK_IMAGE_URL = "ext/resources/images/default/s.gif";
        var app, items = [], controls = [], toolItems = [], lowColor="0000FF", highColor="FF0000", defaultColor="003300", selectedFillColor = "e2ff00", linesOn = false, fillOn = true, colorSchemeOn = false, manualSelectOn = false, inUserConsole=0;
		var navigationMode = true, tilesLeftToLoad=1,inClauseStr="idAttribute:1;inSet:1";whereClauseStr="whereParam:1;whereValue:1", priorityParams ="", prioritizationOn = false, theViewParams="", selectMode=1,ghanActive=false,gosmActive=false,forestThreshold=25;
		var minVal=0, avgVal=0.5, maxVal=1, subDataNum = 0;
		
		//Set default language.  If chanhing this to Spanish, we'll need to update title spacer 475->525, language combobox
		var curLanguage=2;
		var userLayerActive=false;
		
		var locationParamName, nameAttribute, locationData, spanishLocationData, idAttribute;
		var workspaceName = "forestro_users_ws";
		
		//load in initial values here (soon to be replaced through a call to updateDataSource) in order to avoid an error on load
		var dataSourceName = "ca_adm", dataSourceLayerName = "ca_adm_query";
		var userDataSourceUOA = ""
		
		//var topBarHeight=.06*Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var topBarHeight=40;
					
		var imgWait = document.createElement("IMG");imgWait.src = "images/loading.gif";imgWait.style.pointerEvents='none';imgWait.style.position = 'absolute';imgWait.style.top = 225;imgWait.style.left = 450;imgWait.style.zIndex = 9999;imgWait.style.visibility = 'hidden';
		var imgZoomEng = document.createElement("IMG");imgZoomEng.id="imgzoomeng";imgZoomEng.src = "images/zoomin_english.gif";imgZoomEng.style.pointerEvents='none';imgZoomEng.style.position = 'absolute';imgZoomEng.style.top = 225;imgZoomEng.style.left = 450;imgZoomEng.style.zIndex = 9998;imgZoomEng.style.visibility = 'hidden';
		var imgZoomSpan = document.createElement("IMG");imgZoomSpan.id="imgzoomspan";imgZoomSpan.src = "images/zoomin_spanish.gif";;imgZoomSpan.style.pointerEvents='none';imgZoomSpan.style.position = 'absolute';imgZoomSpan.style.top = 225;imgZoomSpan.style.left = 450;imgZoomSpan.style.zIndex = 9998;imgZoomSpan.style.visibility = 'hidden';
				
		var numOnBoardDataSets=6;		
		var dataSourceNum=5;	

		//Detect whether browser is IE to disable functions that don't work in IE yet:
		var isIE = /*@cc_on!@*/false || !!document.documentMode;		
			
		var instructionsWindow = new Ext.Window({
			title : "Instructions",
			x: window.innerWidth-310,
			y: 150,
			width: 300,
			height: window.innerHeight - 175,
			closable: false, 
			minimizable: true,
			layout : 'fit',
			items : [{
				xtype : "box",
				autoEl : {
					tag : "iframe",								
					src : "documents/instructions_define.html"
				}
			}], 
			listeners: {
						'minimize': {
							fn: function () {
							instructionsWindow.hide();										
							}
						}
			}					
		});
		
		var instructionsWindowSp = new Ext.Window({
			title : "Instrucciones",
			x: window.innerWidth-310,
			y: 150,
			width: 300,
			height: window.innerHeight - 175,
			closable: false, 
			minimizable: true,
			layout : 'fit',
			items : [{
				xtype : "box",
				autoEl : {
					tag : "iframe",								
					src : "documents/instructions_define_sp.html"
				}
			}], 
			listeners: {
						'minimize': {
							fn: function () {
							instructionsWindowSp.hide();										
							}
						}
			}					
		});
		
		var loginRegisterWindow= new Ext.Window({
					width: (window.innerWidth-0)*0.8,
					height: (window.innerHeight-topBarHeight)*0.85,
					x: (window.innerWidth-0)*0.1+0,
					y: (window.innerHeight-topBarHeight)*0.1+topBarHeight,
					resizable: false, 
					draggable: true,
					closable:false,
					minimizable: false,
					anchor: true,
					frame:false,shadow:false,border:true,
					bodyStyle: 'opacity:1;',
					layout : 'vbox',
					listeners:{
						minimize: function(){
							loginRegisterWindow.hide();
							
							app.mapPanel.enable();
							myLegend.enable();
							Ext.getCmp("toolPanel").enable();
							
						}
					},
					tools:[{
					   id: 'bigminimize',
					   qtip: 'Minimize',
						handler: function(event, toolEl, panel){
							loginRegisterWindow.hide();
							
							app.mapPanel.enable();
							myLegend.enable();
							Ext.getCmp("toolPanel").enable();
						}
					}],
					items : [
					{
						xtype : "box",
						id : "loginRegisterWindowBox",
						width: (window.innerWidth-0)*0.8,
						height: (window.innerHeight-topBarHeight)*0.85,
						margin: 10,
						autoEl : {
							tag : "iframe",
							frameborder: 0,
							src : "/../../usersystem/splashscreen.php?lang="+curLanguage
						},
						refreshMe : function(src){
							// Fix error when this.el was undefined (16/01/23)
							 var el;
							if (this.el){
								el = this.el;
								el.dom.src = src || this.imageSrc;
							 }
						  },
					  listeners : {
							 render :  function(){
								this.refreshMe();
							 }
					  }
					}
					]
				});
		
        Ext.onReady(function() {
			app = new Ext.Viewport({
                layout: "border",
				id: 'app',
				border:0,
                items: [topbar, toolpanel, map, bottombar]
            });
			
			setDataSource(dataSourceNum);
			
			Ext.getCmp('optionsPanel').collapse();
			Ext.getCmp('colorByAttributePanel').collapse();
			Ext.getCmp('selectPanel').collapse();
									
			myLegend.show();		
			myLegend.alignTo(Ext.getBody(), 'tr-tr', [-10,app.mapPanel.el.getTop()+5]);
			
			Ext.getCmp('regionSelectCombo').setValue(0);					
			Ext.getCmp('regionSelectCombo').selectedIndex = 0;
			
			Ext.getCmp('datasource').selectedIndex = 0;
			Ext.getCmp('selectModeCombo').selectedIndex = 0;
			Ext.getCmp('basemapCombo').selectedIndex = 1;
			Ext.getCmp('methodCombo').selectedIndex = 0;
			Ext.getCmp('compareObjectiveCombo').selectedIndex = 0;
						
			Ext.getCmp('carbonBenefitChoose').selectedIndex = 0;
			Ext.getCmp('bioBenefitChoose').selectedIndex = 0;
			
			Ext.getCmp('topBar').getEl().dom.style.background = '#4682B4';
			
			//Finalize access to the app (formerly, this required user login)
			
				//Log the user into Geoserver using the umbrella "registereduser" username
				if(phpVarIsLocalHost){
					var config = {"method":"GET", "async":false};
					config.url="../../geoserver/wms?request=GetCapabilities";
					config.user="registereduser";
					config.password=phpVarGeoServerLogin;
					var xmlhttp = OpenLayers.Request.issue(config);
					
				//Do the same for WFS (for some reason this is necessary online, but not on localhost. WFS getCapabilities doesn't seem to work with relative URL, so using a getFeature request that I know works.)			
				config.url = "../../geoserver/"+workspaceName+"/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getExtents&viewparams=dataSource:"+dataSourceName;
				config.url +=";"+whereClauseStr+";forestThreshold:"+forestThreshold;
					
				var xmlhttp = OpenLayers.Request.issue(config);			
	
				}
				
				curLanguage=phpVarLanguageToLoadIn;
				updateLanguage();
			
				if (curLanguage==1){Ext.getCmp('loginItem').setText("Logged in as "+phpVarUserName);}
				if (curLanguage==2){Ext.getCmp('loginItem').setText("Conectado como "+phpVarUserName);}
				Ext.getCmp('loginItem').show();
				Ext.getCmp('returnToFCTTItem').hide();
				Ext.getCmp('userConsoleItem').show();
				Ext.getCmp('logoutItem').show();
				// Show	the arrow again on loginItem, now that there are items in it, by removing the 'hidearrow' CSS class
				Ext.getCmp('loginItem').getEl().removeClass('hidearrow');

				app.mapPanel.map.addLayer(hansenLegendLayer);
				app.mapPanel.map.addLayer(colorSchemeLegendLayer);
				app.mapPanel.map.addLayer(marginalityLayer);
				app.mapPanel.map.addLayer(dataLayer);
				app.mapPanel.map.addLayer(selectLayer);
			
			//Customize Login Menu based on whether user is logged in or not
			if (phpVarIsLoggedIn==1){
					
			}
			else{
				
				//Add code to show user survey. Use session vars or cookies to not overdo this?
				
				//For some reason, I need to show and hide loginRegisterWindow for the button click from the meny to show it
				loginRegisterWindow.show();
				loginRegisterWindow.hide();

				if (curLanguage==1){Ext.getCmp('loginItem').setText("Use your own data");}
				if (curLanguage==2){Ext.getCmp('loginItem').setText("Utilice sus propios datos");}
				Ext.getCmp('userConsoleItem').hide();
				Ext.getCmp('logoutItem').hide();
				// Remove the arrow again on loginItem, now that there are no items in it again, by adding the 'hidearrow' CSS class
				Ext.getCmp('loginItem').getEl().addClass('hidearrow');
			}
				
			//Progress indicator events
			registerEvents(dataLayer);
			registerEvents(prioritizationLayer);			
			imgWait.style.top = (parseInt(app.mapPanel.body.dom.style.height)-128)/2;
			imgWait.style.left = (parseInt(app.mapPanel.body.dom.style.width)-128)/2;
			document.getElementById('map').appendChild(imgWait);
			
			imgZoomEng.style.top = 50;
			imgZoomEng.style.left = (parseInt(app.mapPanel.body.dom.style.width)-750)/2;
			document.getElementById('map').appendChild(imgZoomEng);
			imgZoomSpan.style.top = 50;
			imgZoomSpan.style.left = (parseInt(app.mapPanel.body.dom.style.width)-750)/2;
			document.getElementById('map').appendChild(imgZoomSpan);
							
				
			updateLanguage();	
			
			//Add click control to map (had to do this here after app.mapPanel.map is loaded
			app.mapPanel.map.addControl(infoClick);
			infoClick.activate();
			
			//Add hover control but keep it deactivated until user chooses an attribute to color by the values of
			app.mapPanel.map.addControl(infoHover);
			infoHover.deactivate();
			
			ghan.setVisibility(false);
			ghyb.setVisibility(false);
			gsat.setVisibility(false);
			gosm.setVisibility(false);
			gphy.setVisibility(false);
			marginalityLayer.setVisibility(false);
			prioritizationLayer.setVisibility(false);
			updateStyling();	
						
			//For some reason shadow was not collapsing in legend until doing this:
			myLegend.syncShadow();
	    });		

	//The following code fixes a bug with Ext, that causes unnecessary scrollbars in the attribute list.
    Ext.chromeVersion = Ext.isChrome ? parseInt(( /chrome\/(\d{2})/ ).exec(navigator.userAgent.toLowerCase())[1],10) : NaN;
 
    Ext.grid.ColumnModel.override({
        getTotalWidth : function(includeHidden) {
            if (!this.totalWidth) {
                var boxsizeadj = (Ext.isChrome && Ext.chromeVersion > 18 ? 2 : 0);
                this.totalWidth = 0;
                for (var i = 0, len = this.config.length; i < len; i++) {
                    if (includeHidden || !this.isHidden(i)) {
                        this.totalWidth += (this.getColumnWidth(i) + boxsizeadj);
                    }
                }
            }
            return this.totalWidth;
        }
    });
	//End bug fix code

		//http://osgeo-org.1560.x6.nabble.com/Re-Reg-Map-not-printed-in-mapfish-print-WMS-layer-is-Secured-td5106623.html
		//http://www.mapfish.org/doc/print/configuration.html
	
		//Somewhat ad-hoc fix of a cross-domain type request I was getting on localhost, when printCapabilities.createURL was loaded as "http://localhost:8080/geoserver/pdf/create.json" from info.json
		if(phpVarIsLocalHost){
			printCapabilities.createURL = "../../geoserver/pdf/create.json";
			printCapabilities.printURL = "../../geoserver/pdf/print.pdf";
		};
		
		var printProvider = new GeoExt.data.PrintProvider({
			url: "../../geoserver/pdf",
			user: "registereduser",
			password: phpVarGeoServerLogin,
			method: "POST", // "POST" recommended for production use
			capabilities: printCapabilities, // from the info.json script in the html
			timeout: 100000,
			customParams: {
				mapTitle: "",
				comment: "www.conservationroi.net",
				attributionText: ""
			},
			listeners : {
				 beforeprint :  function(){
					app.mapPanel.body.dom.style.cursor = 'wait';
					imgWait.style.visibility = 'visible';
				 },
					print :  function(){
					app.mapPanel.body.dom.style.cursor = 'pointer';
					imgWait.style.visibility = 'hidden';
					if(Ext.getCmp('printDialog')){Ext.getCmp('printDialog').destroy()};
				 },
					printexception:  function(){
					if(curLanguage==1){alert("Sorry, there was an error while generating the PDF file. Please contact fc-targeting-tool@rff.org to report this problem.");};
					if(curLanguage==2){alert("Lo sentimos, hubo un error al generar el archivo PDF. Por favor, póngase en contacto con fc-targeting-tool@rff.org reportar este problema.");};
					app.mapPanel.body.dom.style.cursor = 'pointer';
					imgWait.style.visibility = 'hidden';
					if(Ext.getCmp('printDialog')){Ext.getCmp('printDialog').destroy()};
				}
			}
		});
		// Our print page. Tells the PrintProvider about the scale and center of
		// our page.
		printPage = new GeoExt.data.PrintPage({
			printProvider: printProvider
		});
		
		//set dpi to second highest (300dpi)
		if(printProvider.dpis.totalLength>2){
			var dpi = printProvider.dpis.getAt(printProvider.dpis.totalLength-2);
			printProvider.setDpi(dpi);
		}
				
		//End printing code
	
	//Create Legend Object
	var myLegend = new Ext.Window({
			id: 'myLegend',
			title: "Legend",
			width:250,
			collapsible: true,
			autoScroll: true,
			layout: 'anchor',
			closable: false,
			monitorResize: true,
			items: [
				legendPanel = new GeoExt.LegendPanel({
					defaults: {
						id: 'myLegendPanel',
						//legendTitle: 'Legend',
						name: 'legend',
						labelCls: 'mylabel',
						style: 'padding:5px', 
						baseParams: {format: 'image/png', legend_options:'forceLabels:on'}//;name:legend
					},
					preferredTypes: ["gx_wmslegend"],
					dynamic: true,
					bodyStyle: 'padding:5px',
					autoScroll: true,
					region: 'west'
				})
			]
		});
		
//---------------------------------           LAYERS              -----------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------		
		
//-----------------------------------------Basemaps

		var gphy = new OpenLayers.Layer.Google(
			"Google Physical",
			{type: google.maps.MapTypeId.TERRAIN, sphericalMercator: true, isBaseLayer: true, numZoomLevels: 23, MAX_ZOOM_LEVEL: 22}
			// used to be {type: G_PHYSICAL_MAP}
		);
		var ghyb = new OpenLayers.Layer.Google(
			"Google Hybrid",
			{type: google.maps.MapTypeId.HYBRID, sphericalMercator: true, isBaseLayer: true, numZoomLevels: 23, MAX_ZOOM_LEVEL: 22}
			// used to be {type: G_HYBRID_MAP, numZoomLevels: 20}
		);
		var gsat = new OpenLayers.Layer.Google(
			"Google Satellite",
			{type: google.maps.MapTypeId.SATELLITE, sphericalMercator: true, isBaseLayer: true, numZoomLevels: 23, MAX_ZOOM_LEVEL: 22}
			// used to be {type: G_SATELLITE_MAP, numZoomLevels: 22}
		);		

		var gosm = new OpenLayers.Layer.Bing({
                name: "Street Map from Bing",
                key: "AjLkKtM4SsAS70LNS4LKSne_Kk-dhlcf4GM5_5xEzAdLtC46M5Z4vAqhZojRQUh5",
                type: "Road"
            });
		
		//qj3gZzSVK7ppikLtc1gTlRwaI4TMWva
		var ghan = new OpenLayers.Layer.XYZ("Hansen Forest Cover", "http://earthengine.google.org/static/hansen_2013/loss_forest_gain/${z}/${x}/${y}.png",{sphericalMercator:true,attribution:"Hansen et al. 2014", isBaseLayer:true});		
		
//-----------------------------------------Data layers and stores		
		
		var dataLayer = new OpenLayers.Layer.WMS(
                "Data Layer",
                "../../geoserver/wms",
                //{layers: 'forestro_ws:mredd_wgs84', transparent: true},{isBaseLayer: false, displayInLayerSwitcher: false, opacity:.65,projection: "EPSG:900913",tileOptions: {maxGetUrlLength: 2500}}
				{layers: dataSourceLayerName, transparent: true},{singleTile: true, transitionEffect: 'resize', opacity: .65, displayInLayerSwitcher: false, projection: "EPSG:900913",tileOptions: {maxGetUrlLength: 2500}} //3857 4326 900913 , isBaseLayer: false,
        );
		
		var marginalityLayer = new OpenLayers.Layer.WMS(
                "Marginalization Index",
                "../../geoserver/wms",
                {layers: 'forestro_users_ws:marginality', transparent: true,styles: "marginality"},{singleTile: true, transitionEffect: 'resize', isBaseLayer: false, displayInLayerSwitcher: true, opacity:1,projection: "EPSG:900913",tileOptions: {maxGetUrlLength: 2500}}
        );
		
		var selectLayer = new OpenLayers.Layer.Vector("Selection", {
			//styleMap: new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"]),
			displayInLayerSwitcher: false,
			transparent:true
		});
			
		var prioritizationLayer = new OpenLayers.Layer.WMS(
                "Prioritization Results",
                "../../geoserver/wms",
                {layers: workspaceName+':data_prioritize', transparent: true},{singleTile: true, transitionEffect: 'resize', isBaseLayer: false,  displayInLayerSwitcher: true, opacity:.9,projection: "EPSG:900913",tileOptions: {maxGetUrlLength: 5000}}
        );
		//Start prioritizationLayer as not visible(even though it's not added to map yet), so that prioiritizationOn variable sets to false when we call updatePrioritization
		prioritizationLayer.setVisibility(false);
		
		var highlightedFeaturesCopy = selectLayer.clone();

		//"Layers" for legend
			//var colorSchemeLegendLayer= new OpenLayers.Layer.Vector("Color By Attribute Scheme", {
			
			//We need a seperate legend Layer for the Data Later because the interpolate function doesn't work with the WMS legend
			var colorSchemeLegendLayer= new OpenLayers.Layer.WMS(
			    "Color By Attribute Scheme",
                "../../geoserver/wms",
				{layers: workspaceName+':dummyDataLayerForWMSLegend',transparent:true},
				{
					isBaseLayer: false,
					displayInLayerSwitcher: true
				}
			);

			//We need a seperate legend Layer for the Data Later because we can't add a style to the Tile layer
			var hansenLegendLayer= new OpenLayers.Layer.WMS(
			    "Hansen Basemap",
                "../../geoserver/wms",
				{layers: workspaceName+':dummyDataLayerForWMSLegend',transparent:true},
				{
					isBaseLayer: false,
					displayInLayerSwitcher: true
				}
			);

		//Set up event registration for "Ajaxloader" waiting graphic
		function registerEvents(layer) {
				layer.events.register("loadstart", layer, function() {
					app.mapPanel.body.dom.style.cursor = 'wait';
					imgWait.style.visibility = 'visible';
				});
				layer.events.register("loadend", layer, function() {
					app.mapPanel.body.dom.style.cursor = 'pointer';
					imgWait.style.visibility = 'hidden';
				});
        };
		
		var prioritizationVariables = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Carbon',' t/ha'],['bio','Biodiversity',' RWRI'], ['hydro','Hydrological services index', ''], ['risk', 'Deforestation risk', '%'], ['cost','Cost',' ($ or pes)/ha'], ['forarea','Percent forest coverage',' %'], ['scenario1','Carbon  expected benefit per cost', ''], ['scenario2','Biodiversity expected benefit per cost', ''], ['scenario3','Hydro  expected benefit per cost', '']]	//['annualloss','Total Annual Loss']						
		});
		var prioritizationVariablesSpanish = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Carbono',' t/ha'],['bio','Biodiversidad',' RWRI'], ['hydro','Indice de servicios hidrológicos', ''], ['risk', 'Riesgo de deforestación', '%'], ['cost','Costo',' ($ o pes)/ha'], ['forarea','Cubierta forestal porcentaje',' %'], ['scenario1','Beneficio esperado de carbono por costo', ''], ['scenario2','Beneficio esperado biodiversidad  por costo', ''], ['scenario3','Beneficio esperado hidrológico por costo', '']]//['annualloss','Pérdida total anual'],
		});		
		var prioritizationVariablesCA = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Non-soil carbon (biomass)',' t/ha'],['carbon_total','Total carbon (biomass and soil)',' t/ha'],['carbon_soil','Carbon in soil',' t/ha'],['bio','RWRI biodiversity index (global weights)',' RWRI'],['bio_loc','RWRI biodiversity index (national weights)',' RWRI'],['bio_count','Threatened species count',' #'], ['hydro','Hydrological services index', ''], ['risk', 'Deforestation risk', '%'], ['cost','Cost',' ($ or pes)/ha'], ['forarea','Percent forest coverage',' %'], ['scenario1','Carbon (non-soil) expected benefit per cost', ''], ['scenario2','Biodiversity (global RWRI) expected benefit per cost', ''], ['scenario3','Hydro  expected benefit per cost', '']]	//['annualloss','Total Annual Loss']						
		});
		var prioritizationVariablesSpanishCA = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Carbono no suelo (biomasa)',' t/ha'],['carbon_total','Carbono total (biomasa y suelo)',' t/ha'],['carbon_soil','Carbono en el suelo',' t/ha'],['bio','Índice RWRI de biodiversidad (pesos globales)',' RWRI'],['bio_loc','Índice RWRI de biodiversidad (pesos nacionales)',' RWRI'],['bio_count','Número especies amenazadas',' #'], ['hydro','Indice de servicios hidrológicos', ''], ['risk', 'Riesgo de deforestación', '%'], ['cost','Costo',' ($ o pes)/ha'], ['forarea','Cubierta forestal porcentaje',' %'], ['scenario1','Beneficio esperado de carbono (no suelo) por costo', ''], ['scenario2','Beneficio esperado biodiversidad (RWRI global) por costo', ''], ['scenario3','Beneficio esperado hidrológico por costo', '']]//['annualloss','Pérdida total anual'],
		});	
		var prioritizationVariablesSA = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Carbon',' t/ha'],['bio','RWRI biodiversity index * 10^6 (global weights)',' RWRI'],['bio_count','Threatened species count',' #'], ['hydro','Hydrological services index', ''], ['risk', 'Deforestation risk', '%'], ['cost','Cost',' ($ or pes)/ha'], ['forarea','Percent forest coverage',' %'], ['scenario1','Carbon (non-soil) expected benefit per cost', ''], ['scenario2','Biodiversity (global RWRI) expected benefit per cost', ''], ['scenario3','Hydro  expected benefit per cost', '']]	//['annualloss','Total Annual Loss']						
		});
		var prioritizationVariablesSpanishSA = new Ext.data.ArrayStore({
			fields: ['name', 'displayName','unit'],
			data: [['carbon','Carbono',' t/ha'],['bio','Índice RWRI de biodiversidad * 10^6 (pesos globales)',' RWRI'],['bio_count','Número especies amenazadas',' #'], ['hydro','Indice de servicios hidrológicos', ''], ['risk', 'Riesgo de deforestación', '%'], ['cost','Costo',' ($ o pes)/ha'], ['forarea','Cubierta forestal porcentaje',' %'], ['scenario1','Beneficio esperado de carbono (no suelo) por costo', ''], ['scenario2','Beneficio esperado biodiversidad (RWRI global) por costo', ''], ['scenario3','Beneficio esperado hidrológico por costo', '']]//['annualloss','Pérdida total anual'],
		});	
//---------------------------------        MAP OBJECT                  ------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
		
		var map = {
            xtype: "gx_mappanel",
			id: 'map',
			//split: true,
            ref: "mapPanel",
            region: "center",
			fractionalZoom: true,
			layers: [ghan,gosm,gsat, ghyb, gphy],//, marginalityLayer, dataLayer, selectLayer],
            map: {
                controls: controls,
				eventListeners: {
						"zoomend": function() {
							updateOnZoom(this.getZoom());
						}
				}
            },
			extent: OpenLayers.Bounds.fromArray([
                -10300000, 2300000,
                -7500000, 760000
            ]),			
        };

//---------------------------------        MAP INTERACTIVITY   --------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

		//Create a custom toolbar object to get pan and box zoom tools
		OpenLayers.Control.CustomNavToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {
				    initialize: function(options) {
				        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
				        this.addControls([
						new OpenLayers.Control.ZoomBox({type:OpenLayers.Control.TYPE_TOGGLE, title: "Toggle Box Zoom Tool", zoomOnClick: false})
				        ])
						// To make the custom navtoolbar use the regular navtoolbar style
						this.displayClass = 'olControlNavToolbar'
				    },
					
				    draw: function() {
				        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
                        //this.defaultControl = this.controls[0];
				        return div;
				    }
		});
				
	    //Add interaction controls to the map				
		controls.push(
            navControl = new OpenLayers.Control.Navigation({
				"zoomWheelEnabled": true,
				"mouseWheelOptions": {
					"interval": 250, 
					"cumulative": false
				}
			}),
			panzoomControl  =  new OpenLayers.Control.PanZoom,
			attributionControl  =  new OpenLayers.Control.Attribution,
			//loadingPanelControl  =  new OpenLayers.Control.LoadingPanel(),
			keyboardPanZoomControl  =  new OpenLayers.Control.KeyboardDefaults,
			scaleControl  =  new OpenLayers.Control.ScaleLine({maxWidth: 400}),
			navZoomControl = new OpenLayers.Control.CustomNavToolbar(),
			showCoordinates = new OpenLayers.Control.MousePosition({
					displayProjection: "ESPG:4326",//new OpenLayers.Projection('ESPG:4326'), //map.projection, //new OpenLayers.Projection('EPSG:3857'),
                    separator: ' | ',
					//suffix: '.......................................................................................................................................................',
                    numDigits: 2
            })
		);
		
		//NOTE!: the toggling effect requires a unique field ID for dataLayer, otherwise it's logic gets mixed up when it checks if a feature is already in the seleciton.  To set unique field ID, check "Identifier" box in Edit SQL View for Layer
		//http://lists.osgeo.org/pipermail/openlayers-users/2011-May/020728.html
		//if((userLayerActive) || dataSourceNum == 1 || dataSourceNum==2) {theViewParams+=';predAcessCode:519';}
		var selectBox = new OpenLayers.Control.GetFeature({
				id: "selectControl",
				protocol: OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer, {vendorParams:"predAcessCode:519"}),
				//protocol: OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer,{OpenLayers.Handler.Polygon}),
				click: false,
				clickTolerance: 0,
				box: true,
				//toggle: true,
				//multiple: true,
				multipleKey: "shiftKey",
				toggleKey: "ctrlKey",
			});

			selectBox.events.register("featureselected", this, function(e) {
				selectLayer.addFeatures([e.feature]);
			});
			
			selectBox.events.register("featureunselected", this, function(e) {
				selectLayer.removeFeatures([e.feature]);
				});
		
		var selectPolygon = new OpenLayers.Control.DrawFeature(selectLayer, OpenLayers.Handler.Polygon);
				
		controls.push(selectBox,selectPolygon);

		var myToolTip  = new Ext.ToolTip();
		
		//Display current attribute data on feature hover:		
		OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {                
				defaultHandlerOptions: {
                    'delay': 500,
                    'pixelTolerance': null,
                    'stopMove': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Hover(
                        this,
                        {'pause': this.onPause, 'move': this.onMove},
                        this.handlerOptions
                    );
                }, 

                onPause: function(evt) {
					var features = featuresFromXY(evt.xy);
					if (features.length>0){	
						var theValue = features[0].attributes[Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name]
						if(Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name=="risk"){theValue = theValue*100};
						if(!isNaN(theValue)){theValue = cleanUpIfNumber(Number(theValue))};
						var ttText = "Value of "+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.displayName+": "+theValue+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit;
						myToolTip.destroy();
						myToolTip = new Ext.ToolTip({html:ttText, dismissDelay:2000});
						myToolTip.showAt([evt.xy.x+275,evt.xy.y]);
					}
                }
		});
		
		//Highlight feature shape and display attribute data on click:
		OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},

			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.trigger
					}, this.handlerOptions
				);
			}, 

			trigger: function(e) {
			
				if(Ext.getCmp('printDialog')){Ext.getCmp('printDialog').destroy()};
						
				var features = featuresFromXY(e.xy);
				if (features.length>0){		
				var items = [];	
				selectLayer.removeAllFeatures();	
				
				//Build a propertyNames array to show nice variable names/units in PropertyGrid
					var attributeNames = new Array();
					Ext.each(Ext.getCmp("colorAttribute").store.data.items, function(attribute) {
						if(attribute.data.unit==""){
						attributeNames[attribute.data.name] = attribute.data.displayName;
						}
						else{
							attributeNames[attribute.data.name] = attribute.data.displayName+' ('+attribute.data.unit+')';
						};
					});
					
					if(curLanguage==1){attributeNames['identifying_info'] = 'Identifying information for unit';};
					if(curLanguage==2){attributeNames['identifying_info'] = 'Información de identificación de la unidad';};
				
				Ext.each(features, function(feature) {
				
					//For numeric attributes, show three decimal places or express in scientific notation if first three are zero
					Ext.each(Object.keys(feature.attributes), function(attribute) {
						feature.attributes[attribute] = cleanUpIfNumber(feature.attributes[attribute]);
					});
					
					var featureTitle = "";
					featureTitle = feature.fid.replace("getFeatureInfo_sa.","fctt_id: ").replace("getFeatureInfo_ca.","fctt_id: ").replace("getFeatureInfo_mex.","fctt_id: ").replace("getFeatureInfo_userdata.","fctt_id: ");
					if(typeof feature.attributes[nameAttribute]=="string"){featureTitle +=': '+feature.attributes[nameAttribute]};
					items.push(new Ext.grid.PropertyGrid({
						xtype: "propertygrid",
						id: feature.fid,
						title: featureTitle,
						source: feature.attributes,
						propertyNames: attributeNames,
						autoActivate: true,
						autoExpand: true,
						listeners: {
							'beforeedit': {
								fn: function () {
									return false;
								}
							},
							//The following code allows the user to highlight a single specific feature on the map, by expanding the corresponding panel in the Feature Attributes bar
							'expand': function(p) {
								selectLayer.removeAllFeatures();
								for (var i = 0; i < highlightedFeaturesCopy.features.length; i++) {
									if (highlightedFeaturesCopy.features[i].fid == p.id) 
									{
										selectLayer.addFeatures(highlightedFeaturesCopy.features[i]);
									};
								};
								selectLayer.redraw();
							},
							'render': function(grid) {
								grid.getColumnModel().setColumnWidth(0, 400);
							}
						}								
					}));
					feature.geometry.transform("EPSG:4326","EPSG:900913");
					selectLayer.addFeatures(feature);
					highlightedFeaturesCopy = selectLayer.clone();
					for (var i = 0; i < highlightedFeaturesCopy.features.length; i++) { 
						{
							highlightedFeaturesCopy.features[i].fid = selectLayer.features[i].fid;
						};
					};
					});
					selectLayer.redraw();
					if(Ext.getCmp('attributePanel')){Ext.getCmp('attributePanel').destroy()};
					//if(e.features.length>0){
					new GeoExt.Popup({
						id:"attributePanel",
						title: "Feature Attributes",
						layout: "accordion",
						layoutConfig: {multi: true},
						map: app.mapPanel,
						location: new OpenLayers.Pixel(300,425),
						//location: new OpenLayers.Pixel(e.xy.x+150, e.xy.y+425),
						panIn: false,
						height: 400,		
						width: 550,
						collapsible: true,
						autoScroll: true,
						anchored: false,
						collapsed: true,
						titleCollapse: true,
						items: items, 
						listeners: {
								'close': {
									fn: function () {
										selectLayer.removeAllFeatures();
										highlightedFeaturesCopy.removeAllFeatures();
									}
								}
							}	
					}).show();
				}	
			}
		});

		var infoClick = new OpenLayers.Control.Click();
		var infoHover = new OpenLayers.Control.Hover();
		
//---------------------------------        PANELS              --------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

		//BOTTOM BAR
		var bottombar = {xtype: "container",
				id: "bottomBar",
				ref: "bottomBar",
				height: 15,
				//autoHeight: true,
				padding: 0,
				region: "south",
				border: false,
				//collapsible: true,
				//bodyStyle: "background-color:blue",
				style:'padding:2px 0px 0px 0px',
				//cls: 'topBar',
				items: [
					{xtype:"label", id: 'appCopyright', text: "© 2015 Resources for the Future. All rights reserved. No portion of the data or model may be used without permission.", style: "font: bold 9px arial; color: blue; text-align: center; display:inline-block", width:window.innerWidth}
				]
			};

		//TOP BAR
		var topbar = {xtype: "toolbar",
				id: "topBar",
				ref: "topBar",
				height: topBarHeight,
				//autoHeight: true,
				padding: 0,
				region: "north",
				border: false,
				//collapsible: true,
				//bodyStyle: "background-color:blue",
				style:'padding:0px 0px 0px 0px',
				cls: 'topBar',
				items: [
					//new Ext.Button({text: '<div style="font-size:'+(topBarHeight-10)/2.2+'px">How To</div>', id: 'howToItem', height: topBarHeight,style:'padding:0px 0px 0px 0px',
					new Ext.Button({text: 'How To', id: 'howToItem',
						menu: [{
							text: 'Description', id: 'descriptionItem',						
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/description.pdf", "Forest Conservation Targeting Tool Description")};
								if(curLanguage==2){openPage("documents/description.pdf", "Herramienta Focalización de Conservación Forestal - Descripción")};
							}}
						},{
							text: 'Instructions', id: 'instructionsItem',						
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/instructions.pdf", "Forest Conservation Targeting Tool Instructions")};
								if(curLanguage==2){openPage("documents/instructions.pdf", "Herramienta Focalización de Conservación Forestal - Instrucciones")};
							}}
						},{
							text: 'FAQ', id: 'faqItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/faq.html","Forest Conservation Targeting Tool FAQ")};
								if(curLanguage==2){openPage("documents/faq_sp.html", "Herramienta Focalización de Conservación Forestal - FAQ")};
							}}
						},{
							text: 'Video Tutorial', id: 'videoTutorialItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/tutorial.html","Forest Conservation Targeting Tool Video Tutorial")};
								if(curLanguage==2){openPage("documents/tutorial_sp.html", "Herramienta Focalización de Conservación Forestal - Video Tutorial")};
							}}
						},{
							text: 'User Questions', id: 'userQuestionsItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("http://conservationroi.net/userquestions","Forest Conservation Targeting Tool User Questions")};
								if(curLanguage==2){openPage("http://conservationroi.net/userquestions","Herramienta Focalización de Conservación Forestal - Preguntas de Usuarios")};
							}}
						},{
							text: 'Email', id: 'emailItem',
							listeners: {'click': function() {
								myToolTip.destroy();
								myToolTip = new Ext.ToolTip({html:"fc-targeting-tool@rff.org", dismissDelay:10000, renderTo: Ext.getCmp("emailItem").el});
								myToolTip.showAt(0,0);
								window.location.href = "mailto:fc-targeting-tool@rff.org";
							}}
						}],
						listeners : {
							mouseover : function() {
								this.showMenu();
							},
							menutriggerout : function() {
								//this.hideMenu();
							},
						}
						}),
					new Ext.Button({text: 'About', id: 'aboutItem',
						menu: [{
							text: 'Metadata', id: 'metadataItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/metadata.pdf","Forest Conservation Targeting Tool Metadata")};
								if(curLanguage==2){openPage("documents/metadata.pdf", "Herramienta Focalización de Conservación Forestal - Metadatos")};
							}}
						},{
							text: 'Sponsors', id: 'sponsorsItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/sponsors.pdf","Forest Conservation Targeting Tool Sponsors")};
								if(curLanguage==2){openPage("documents/sponsors.pdf","Herramienta Focalización de Conservación Forestal - Promotores")};
							}}
						},{
							text: 'Team', id: 'teamItem',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("documents/team.pdf","Forest Conservation Targeting Tool Team")};
								if(curLanguage==2){openPage("documents/team.pdf","Herramienta Focalización de Conservación Forestal - Equipo")};
							}}
						},{
							text: 'Email', id: 'emailItem2',
							listeners: {'click': function() {
								myToolTip.destroy();
								myToolTip = new Ext.ToolTip({html:"fc-targeting-tool@rff.org", dismissDelay:3000});
								myToolTip.showAt(0,0);
								window.location.href = "mailto:fc-targeting-tool@rff.org";
							}}
						}], 
						listeners : {
							mouseover : function() {
								this.showMenu();
							},
							menutriggerout : function() {
								//this.hideMenu();
							},
						}
					}),
					new Ext.Button({text: 'Feedback', id: 'feedbackItem',
						menu: [{
							text: 'User Questions', id: 'userQuestionsItem2',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("http://conservationroi.net/userquestions","Forest Conservation Targeting Tool User Questions")};
								if(curLanguage==2){openPage("http://conservationroi.net/userquestions","Herramienta Focalización de Conservación Forestal - Preguntas de Usuarios")};
							}}
						},{ id: 'userCommentsItem', id: 'userCommentsItem',
							text: 'User Comments',
							listeners: {'click': function() {
								if(curLanguage==1){openPage("http://conservationroi.net/usercomments","Forest Conservation Targeting Tool User Comments")};
								if(curLanguage==2){openPage("http://conservationroi.net/usercomments","Herramienta Focalización de Conservación Forestal - Comentarios de Usuarios")};
							}}
						},{
							text: 'Email', id: 'emailItem3',
							listeners: {'click': function() {
								myToolTip.destroy();
								myToolTip = new Ext.ToolTip({html:"fc-targeting-tool@rff.org", dismissDelay:10000, renderTo: Ext.getCmp("emailItem3").el});
								myToolTip.showAt(0,0);
								window.location.href = "mailto:fc-targeting-tool@rff.org";
							}}
						}], 
						listeners : {
							mouseover : function() {
								this.showMenu();
							},
							menutriggerout : function() {
								//this.hideMenu();
							},
						}
					}),
					new Ext.Button({text: 'Use your own data', id: 'loginItem',
						cls: 'hidearrow',
						menu: [
						{ id: 'userConsoleItem',
							text: 'User Console',
							listeners: {'click': function() {

							var goAhead = 0;

						
							if(curLanguage==1){if(confirm("Navigating to the User Console will restart your session in the FCTT. Do you wish to continue?")){goAhead = 1;}}
							if(curLanguage==2){if(confirm("Navegación a la consola de usuario se reiniciará la sesión en el FCTT. ¿Desea continuar?")){goAhead = 1;}}
								
							if(goAhead==1){
							
								imgWait.style.visibility = 'hidden';
								imgZoomEng.style.visibility = 'hidden';
								imgZoomSpan.style.visibility = 'hidden';							
								inUserConsole=1; //this is so that the zoom image is not triggered again in updateOnZoom function
							
								//Ext.getCmp("toolPanel").disable();
								Ext.getCmp("app").toolPanel.el.setWidth(0);
								Ext.getCmp("app").doLayout();
								app.mapPanel.map.div.innerHTML = "<iframe src='../../usersystem/userconsole.php?lang="+curLanguage+"' width = 100% height = 100%></iframe>";
								
								myLegend.hide();
								
								Ext.getCmp('userConsoleItem').hide();
								Ext.getCmp('returnToFCTTItem').show();
							}
							}}
						},{ id: 'returnToFCTTItem',
							text: 'Reload FCTT',
							hidden: true,
							listeners: {'click': function() {
								//header('Location: ../../index_user.html');
								window.top.location.href = '../../index_user.html'
							}}
						},{ id: 'logoutItem',
							text: 'Logout',
							listeners: {'click': function() {
								if(curLanguage==1){if(confirm("Logging out will restart your session in the FCTT. Do you wish to continue?")){window.location = "../../usersystem/logout_fctt.php";}}
								if(curLanguage==2){if(confirm("Hacer clic en 'Logout' se reiniciará su sesión en el FCTT. ¿Desea continuar?")){window.location = "../../usersystem/logout_fctt.php";}}
							}}
						}], 
						listeners : {
							mouseover : function() {
								this.showMenu();
							},
							click : function() {							
									
								if(isIE==true){
									if(curLanguage==1){alert("Uploading your own data is only supported in the Chrome and Firefox browsers at this time, not Internet Explorer. Please use one of these other browsers to access this feature.")};
									if(curLanguage==2){alert("La carga de sus propios datos sólo se admite en los navegadores Chrome y Firefox en este momento, no Internet Explorer. Por favor, use uno de estos navegadores otras para acceder a esta función.")};
								}
								else{								
									if (loginRegisterWindow.hidden==true){
										
										if(phpVarIsLoggedIn==false) {
											loginRegisterWindow.show();
											
											app.mapPanel.disable();
											Ext.getCmp("toolPanel").disable();
											myLegend.disable();
										}
									}
									else {
									
										loginRegisterWindow.hide();
										
										app.mapPanel.enable();
										myLegend.enable();
										Ext.getCmp("toolPanel").enable();
							
									}
								}
								
							},
							menutriggerout : function() {
								//this.hideMenu();
							},
						}
					}),
					{xtype:"spacer",width:10}, 
					{xtype: "container", layout: {type: "vbox", align: "stretch"}, id: 'appTitleContainer', style:'padding:5px 0px 0px;', width: window.innerWidth-625, height: topBarHeight, items: [
						{xtype:"label", id: 'appTitle', text: "Forest Conservation Targeting Tool (Beta)", style: "font: bold "+topBarHeight/1.75+"px arial; color: white; text-align: center; display:inline-block"}
					]},
					"->",
					{xtype:"box", html:'<a href = "http://www.servir.net" target="_blank"><img src="images/nasa-logo.gif" height='+topBarHeight+'></img></a>', height: topBarHeight, align: "top"},
					{xtype:"spacer",width:10},
					{xtype:"box", html:'<a href = "http://www.servir.net" target="_blank"><img src="images/Mesoamerica2.png" height='+topBarHeight+'></img></a>', height: topBarHeight, align: "top"},
					{xtype:"spacer",width:10},
					{xtype:"box", html:'<a href = "http://www.rff.org" target="_blank"><img src="images/rff_transparent.gif" height='+topBarHeight+'></img></a>', height: topBarHeight, align: "top"},
					{xtype:"spacer",width:5},
			]};
	
		//TOOL PANEL (CONTAINS ALL THE OTHERS)
		var toolpanel = {
			id: "toolPanel",
			ref: "toolPanel",
			padding: '0 0 0 0',
            region: "west",
			//split: true,
			title: "<center><div style='color: black; font-weight: bold; font-size: 12px'>Tool Box</div>",
			//bodyStyle: 'background: #E4EAF5',
			bodyStyle: "background-image:url(images/panel2.jpg);background-size: cover",
			collapsible: true,
			//width: 269,
			//style: {overflowY: 'scroll'},
			//autoScroll: false,
			width:255,
			autoScroll: true,
			//scrollOffset:-50,
			//layout: 'column',
			items: toolItems,
			//tbar: [{id: "progBar", text: "Load progress ", xtype: "progress", width: 240, value:0}],
			tbar: new Ext.Toolbar ({
				  items: [
					{xtype: 'spacer',width:20},
					new Ext.Toolbar.TextItem ("Language/Idioma:"), 
					{xtype: "combo", id:"language", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 110, queryMode:'local', value:'Español', store: [[1,'English'],[2,'Español']],  
										listeners: {'select': function(combo, record, index) {			
										curLanguage=index+1;
										updateLanguage();
					}}}
				  ]
				}),
			bbar: [
					{id: "resetButton", text: "<div style='color:blue;font-weight: bold;font-size: 12'>Reset All</div>", handler: function() {		
						
						// Fix reload not working: Reload all page (16/01/23)
						document.location.reload(true);			
						
						// All this is ignores
						dataSourceNum=Ext.getCmp('datasource').store.data.items[Ext.getCmp('datasource').selectedIndex].data.field1;;
						
						setDataSource(dataSourceNum);
						
						if(app.mapPanel.map.getZoom() < 8 && (dataSourceNum==4 || dataSourceNum==7)){dataLayer.setVisibility(false)};	
						
						Ext.getCmp("chkLines").setValue(linesOn);
						
						Ext.getCmp("chkRisk").setValue(true);
						Ext.getCmp("chkCost").setValue(true);
						Ext.getCmp("chkMean").setValue(false);
						Ext.getCmp("chkArea").setValue(true);						
						
						whereClauseStr="whereParam:1;whereValue:1";
						inClauseStr="idAttribute:1;inSet:1";
						forestThreshold=25;
						Ext.getCmp('thresholdSlider').setValue(forestThreshold);
						
						updateDataLayerParams();
						updatePrioritization();
						
						Ext.getCmp('regionSelectCombo').setValue(0);
						Ext.getCmp('regionSelectCombo').selectedIndex = 0;						
						
						Ext.getCmp('colorAttribute').getSelectionModel().clearSelections();
						colorSchemeOn=false;
						infoHover.deactivate();
						
						Ext.getCmp('chkMarginality').setValue(false);
						marginalityLayer.setVisibility(false);	
											
						prioritizationLayer.setVisibility(false);									
						selectLayer.removeAllFeatures();
						selectBox.protocol=OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer);
						
						zoomToRegion();									
						updateOnZoom(app.mapPanel.map.getZoom()); 
						updateStyling();
						dataLayer.redraw();
						resetLegendPosition();
						manualSelectOn = false;
					}}, 
						'->',
						{
						id: "resetLegend",
						text: "Reset Legend Position",
						handler: function() {
							resetLegendPosition();
						}}				
			]
		};		
							
		//STUDY AREA PANEL
		var regionPanel = {
			id: "regionPanel",
			title: "DEFINE STUDY AREA",
			collapsible: true,
			titleCollapse: true,
			layout: "form",
			bodyStyle: 'padding: 3px;',
			labelWidth: 80,
			items: [
			{xtype:'compositefield', fieldLabel: 'Dataset', id: 'datasetLabel', items: [{xtype: "combo", id:"datasource", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 130, listWidth: 200, queryMode:'local', value:'Central America 10km', store: [[5,'Central America Administrative'], [3,'Central America 10km'],[4,'Central America 1km'],[2,'Mexico Predios'],[1,'MREDD AATRs']],  
							columns: [
								{header: 'field1',  dataIndex: 'field1'},
								{header: 'field2', dataIndex: 'field2'}
							],
							listeners: 
								//first, prevent user from choosing the "--------" seperator
								{'beforeselect': function(combo, record, index) {
									if(Ext.getCmp('datasource').store.data.items[Ext.getCmp('datasource').selectedIndex].data.field1==-1) {
										return false;
									}
								}, 'select': function(combo, record, index) {							
							
								var oldDataSourceNum = dataSourceNum;
								var newDataSourceNum = Ext.getCmp('datasource').store.data.items[Ext.getCmp('datasource').selectedIndex].data.field1;
								
								if (oldDataSourceNum != newDataSourceNum) {			

									colorSchemeOn=false;
								
									Ext.getCmp("adminSelect").show();
									dataSourceNum=newDataSourceNum;
									setDataSource(dataSourceNum);
			
									if(app.mapPanel.map.getZoom() < 8 && dataSourceNum==4){dataLayer.setVisibility(false)};																		
																										
									inClauseStr="idAttribute:1;inSet:1";													
									if ((oldDataSourceNum==3||oldDataSourceNum==4||oldDataSourceNum==5)&&(newDataSourceNum==3||newDataSourceNum==4||newDataSourceNum==5)) {
									}
									else{					
										manualSelectOn = false;
										whereClauseStr="whereParam:1;whereValue:1";
										Ext.getCmp('regionSelectCombo').selectedIndex = 0;
										Ext.getCmp('regionSelectCombo').setValue(0);				
										zoomToRegion();
									};			
												
									updateDataLayerParams();
									updatePrioritization;
									prioritizationLayer.setVisibility(false);									
									
									selectLayer.removeAllFeatures();
									selectBox.protocol=OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer);
																	
									Ext.getCmp("chkLines").setValue(linesOn);
									updateOnZoom(app.mapPanel.map.getZoom()); 
									dataLayer.redraw();
									updateStyling();
									
									if(dataSourceNum==1 || dataSourceNum==2){
										Ext.getCmp("chkMarginality").setDisabled(false);
									} else{
										Ext.getCmp("chkMarginality").setDisabled(true);
										Ext.getCmp('chkMarginality').setValue(false);
										marginalityLayer.setVisibility(false);	
									};							
									
									prioritizationLayer.setVisibility(false);	
									prioritizationLayer.redraw();
								}
								}
								}
						}]
			},
			{xtype:'compositefield', fieldLabel: 'Subdataset', id: 'subdatasetLabel', hidden:true, items: [{xtype: "combo", id:"subdatasource", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 130, listWidth: 250, queryMode:'local', value:'Ecuador', store: [[1,'Ecuador'],[2,'Bolivia-Santa Cruz'],[3,'Bolivia-El Beni,La Paz'],[4,'Bolivia-Others'],[5,'Colombia-A'],[6,'Colombia-B'],[7,'Colombia-C'],[8,'Brazil-A'],[9,'Brazil-B'],[10,'Brazil-C'],[11,'Brazil-D'],[12,'Brazil-E'],[13,'Brazil-F'],[14,'Brazil-G'],[15,'Brazil-H (São Paulo)'],[16,'Brazil-I'],[17,'Brazil-J'],[18,'Brazil-K'],[19,'Brazil-L'],[20,'Brazil-M(Mato Grosso I)'],[21,'Brazil-N(Mato Grosso II)'],[22,'Brazil-O(Pará I)'],[23,'Brazil-P(Pará II)'],[24,'Brazil-Q(Pará III)'],[25,'Brazil-R(Amazonas I)'],[26,'Brazil-S(Amazonas II)'],[27,'Brazil-T(Amazonas III)'],[28,'Guyana and Uruguay'],[29,'Paraguay'],[30,'Venezuela-Amazonas,Anzoátegui,Bolívar'],[31,'Venezuela-Others'],[32,'Chile-A*'],[33,'Chile-B'],[34,'Chile-C'],[35,'Peru-A'],[36,'Peru-B'],[37,'Peru-C'],[38,'Argentina-A(Buenos Aires)'],[39,'Argentina-B'],[40,'Argentina-C'],[41,'Argentina-D'],[42,'Argentina-E'],[43,'Argentina-F'],[44,'Argentina-G'],[45,'Argentina-H'],[46,'Argentina-I'],[46,'Argentina-J']],
							columns: [
								{header: 'field1',  dataIndex: 'field1'},
								{header: 'field2', dataIndex: 'field2'}
							],
							listeners: 
								//first, prevent user from choosing the "--------" seperator
								{'beforeselect': function(combo, record, index) {
									if(Ext.getCmp('subdatasource').store.data.items[Ext.getCmp('subdatasource').selectedIndex].data.field1==-1) {
										return false;
									}
								}, 'select': function(combo, record, index) {							
							
								var oldSubDataNum = subDataNum;
								var newSubDataNum = Ext.getCmp('subdatasource').store.data.items[Ext.getCmp('subdatasource').selectedIndex].data.field1;

								if (oldSubDataNum != newSubDataNum) {			

									colorSchemeOn=false;
									subDataNum=newSubDataNum;
			
									//if(app.mapPanel.map.getZoom() < 8 && dataSourceNum==4){dataLayer.setVisibility(false)};																		
																										
									inClauseStr="idAttribute:1;inSet:1";													
									whereClauseStr="regionNum:"+subDataNum+";whereParam:1;whereValue:1";
												
									updateDataLayerParams();
									updatePrioritization;
									prioritizationLayer.setVisibility(false);									
									
									selectLayer.removeAllFeatures();
									selectBox.protocol=OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer);
																	
									Ext.getCmp("chkLines").setValue(linesOn);
									updateOnZoom(app.mapPanel.map.getZoom()); 
									dataLayer.redraw();
									updateStyling();						
									
									dataSourceName = "sa_1km_r"+subDataNum;
									zoomToRegion();
									prioritizationLayer.redraw();
								}
								}
								}
						}]
			},
			{xtype:'compositefield', fieldLabel: 'Minimum Forest Cover', id:'thresholdLabel', hidden: false, items: [
					{
						xtype: "slider",
						id: "thresholdSlider",
						aggressive: true,
						vertical: false,
						useTips: false,
						value: 25,
						maxValue: 100,
						minValue: 25,
						width: 88,
						listeners: {
							change: function(slider) {
								Ext.getCmp("thresholdValueLabel").setText(slider.getValue()+"%");
								forestThreshold = slider.getValue();
								//updateStyling();
								//updatePrioritization();
							}
							
						}
					},
					{xtype: "label", id: "thresholdValueLabel", text: "25%", style: {padding: "3px 0px 0px 0px"}},
					{xtype: "button", id: 'updatethreshold', hidden: false, cls: 'boldbutton',text: "", icon: 'images/refresh.gif',
						listeners: {
							click: function(){
								updateStyling();
								updatePrioritization();
							}
						}
					},
					{xtype: "textfield", id:"blah", width: 0, hidden: true},	//this textfield is in here only because javascript seems to throw an error	if the slider is alone in the compositefield
			]},
			{xtype: "panel", title: "By administrative boundary", id: 'adminSelect', collapsible:true, collapsed: true, titleCollapse: true, labelWidth: 80,layout: 'form', style:'padding 0px 0px 10px 0px',items: [			
				{xtype:'compositefield', fieldLabel: 'Region', id: 'regionLabel', items: [
					{xtype: "combo", id:"regionSelectCombo", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 130,
						value:'All Countries',
						store: [[0,'All Countries'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']],						queryMode:'local',
						listeners: {'select': function(combo, record, index) {

							var numericindex=Ext.getCmp('regionSelectCombo').store.data.items[Ext.getCmp('regionSelectCombo').selectedIndex].data.field1;
							if(dataSourceNum != 7){   //Don't want to reset regionNum (which is in whereClauseStr) if on sa_1km layer, if the user just clicks the regionSelect button
								if(numericindex>0){						
									manualSelectOn = true;
									whereClauseStr='whereParam:'+locationParamName+';whereValue:'+numericindex;
									inClauseStr="idAttribute:1;inSet:1";
									updateDataLayerParams();
									updatePrioritization;
								}
								else {
									manualSelectOn = false;
									whereClauseStr='whereParam:1;whereValue:1';
									inClauseStr="idAttribute:1;inSet:1";
									//dataLayer.mergeNewParams({viewparams:inClauseStr+';'+whereClauseStr+";forestThreshold:"+forestThreshold});
									updateDataLayerParams();
									updatePrioritization;
								};
							};
							
							prioritizationLayer.setVisibility(false);		
							zoomToRegion();
							updateStyling();
							}}
					}, 
					]
				}]
			},
			{xtype: "panel", title: "Using manual selection tool", id: 'manuallySelect', collapsible:true, collapsed: true, titleCollapse: true, layout: 'form', style:'padding 0px 0px 10px 0px',
				items: [
					{xtype:'compositefield', fieldLabel: 'Selection Mode', id: 'selectionMode', items: [{xtype: "combo", id:"selectModeCombo", selectedIndex:0, width: 110, allowBlank:false, editable: false, triggerAction: 'all', queryMode:'local', value:'Polygon', store: [[1,'Polygon'],[2,'Box']],//,[3,'Upload Shapefile']],
							//matchFieldWidth: false, listConfig: {width: 20},
							listeners: {'select': function(combo, record, index) {
								selectMode = index+1;
								Ext.getCmp("selectsubmitselection").enable();
								
								if(selectMode==2){
									if(userLayerActive){
										if (curLanguage==1) {Ext.Msg.alert("","Unfortunately, the Box/Manual Select Tool can not be used with user-defined layers at this time. Note that you can create an arbitrary region of interest for user-defined layers by restricting your shapefile to the fctt_id you are interested in before uploading the data in the User Console");};
										if (curLanguage==2) {Ext.Msg.alert("","Desafortunadamente, la Herramienta Caja/Selección Manual no se puede utilizar con capas definidas por el usuario en este momento. Tenga en cuenta que puede crear una región arbitraria de interés para las capas definidas por el usuario mediante la restricción de su archivo de formas a la fctt_id le interesa antes de cargar los datos en la consola de usuario.");};
										Ext.getCmp("selectsubmitselection").disable();
									}
									else{																
										if (curLanguage==1) {Ext.Msg.alert("Note","Use of the Box/Manual Select Tool is not possible for selecting more than 10,000 shapes. In this case, please use the Within Polygon or Upload Shapefile tool.");};
										if (curLanguage==2) {Ext.Msg.alert("Nota","De usuario de la herramienta de selección Caja/Clic Manual no se posible para la selección de más de 10,000 formas. En este caso, por favor, utilice la herramienta de Dentro Polígono o Subir Shapefile.");};
									};					
								};
							}
						}
					}]
					}
				],
			listeners: {'expand': function() {							
					if(typeof instructionsWindow != "undefined"){
							if(curLanguage==1){instructionsWindow.show();instructionsWindowSp.hide()};
							if(curLanguage==2){instructionsWindow.hide();instructionsWindowSp.show()};
					};
				}
			},
				bbar: [{xtype: "button", id: 'selectsubmitselection', text: "<div style='color:green; font-weight: bold;font-size: 12'>Begin Selecting</div>", cls: 'boldbutton',icon: 'images/submit.gif',
					handler: function() {
						if(navigationMode){
							navigationMode=false;
							if(selectMode==1){
								selectPolygon.activate();
							};
							if(selectMode==2){
								selectBox.activate();
							};							
							infoHover.deactivate();
							infoClick.deactivate();
							selectLayer.removeAllFeatures();
							selectLayer.redraw();
							//Ext.getCmp('regionSelectCombo').setValue(0);
							//dataLayer.mergeNewParams({viewparams:'idAttribute:1;inSet:1'});
							//dataLayer.redraw();
							if(Ext.getCmp('attributePanel')){
								Ext.getCmp('attributePanel').removeAll();
								Ext.getCmp('attributePanel').close();
							};
							Ext.getCmp('cancelclearselection').show();
							Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Submit to Server</div>");
						}
						else{
							if(selectMode==1){
								//alert(Object.keys(selectLayer.features[0].geometry.components));
								if(selectLayer.features.length==0){
									Ext.Msg.alert("Whoops!","No feature drawn. Please use the mouse to draw a study area polygon. Double-click to complete.");
									if (curLanguage==2) {Ext.Msg.alert("¡Ay!","Sin Características dibujadas. Utilice el ratón para dibujar una área de estudio polígono. Haga doble clic para completar.");};
								};
								if(selectLayer.features.length==1){
									var feature = selectLayer.features[0];
									if(feature.geometry.components[0].components.length<4){
										if (curLanguage==1) {Ext.Msg.alert("Whoops!","Polygon must have at least three vertices.");};
										if (curLanguage==2) {Ext.Msg.alert("¡Ay!","Polígono debe tener al menos tres vértices.");};
										manualSelectOn = false;
									}
									else {
										manualSelectOn = true;
										shapeArea = Math.floor(feature.geometry.getArea()/1000000);
										feature.geometry.transform("EPSG:900913","EPSG:4326");
										
										if(dataSourceNum==4 & feature.geometry.getArea()>10.5){
											if(curLanguage==1){Ext.Msg.alert("Warning", "The largest area of 1km Central America data that the FCTT can work with is about 150,000 square kilometers. Your shape is roughly "+shapeArea+" square kilometers, so please select a smaller one");};
											if(curLanguage==2){Ext.Msg.alert("Aviso", "El área más grande de datos de 1km de Centroamérica con la que puede trabajar el FCTT es de aproximadamente 150,000 kilómetros cuadrados. Tu forma es más o menos "+shapeArea+" kilómetros cuadrados, así que por favor seleccione uno más pequeño");};			
											colorSchemeOn=false;
											manualSelectOn = false;
											app.mapPanel.body.dom.style.cursor = 'pointer';
											imgWait.style.visibility = 'hidden';
										}
										else if(dataSourceNum==6 & feature.geometry.getArea()>600){
											if(curLanguage==1){Ext.Msg.alert("Warning", "The largest area of 10km South America data that the FCTT can work with is about 7,500,000 square kilometers. Your shape is roughly "+shapeArea+" square kilometers, so please select a smaller one");};
											if(curLanguage==2){Ext.Msg.alert("Aviso", "El área más grande de datos de 10km de Sudamérica con la que puede trabajar el FCTT es de aproximadamente 7,500,000 kilómetros cuadrados. Tu forma es más o menos "+shapeArea+" kilómetros cuadrados, así que por favor seleccione uno más pequeño");};			
											colorSchemeOn=false;
											manualSelectOn = false;
											app.mapPanel.body.dom.style.cursor = 'pointer';
											imgWait.style.visibility = 'hidden';
										}
										else if(dataSourceNum==7 & feature.geometry.getArea()>10.5){
											if(curLanguage==1){Ext.Msg.alert("Warning", "The largest area of 1km South America data that the FCTT can work with is about 150,000 square kilometers. Your shape is roughly "+shapeArea+" square kilometers, so please select a smaller one");};
											if(curLanguage==2){Ext.Msg.alert("Aviso", "El área más grande de datos de 1km de Sudamérica con la que puede trabajar el FCTT es de aproximadamente 150,000 kilómetros cuadrados. Tu forma es más o menos "+shapeArea+" kilómetros cuadrados, así que por favor seleccione uno más pequeño");};			
											colorSchemeOn=false;
											manualSelectOn = false;
											app.mapPanel.body.dom.style.cursor = 'pointer';
											imgWait.style.visibility = 'hidden';
										}
										else {
											whereClauseStr = feature.geometry.toString();
											whereClauseStr = whereClauseStr.replace("POLYGON","LINESTRING");
											whereClauseStr = whereClauseStr.replace("((","(");
											whereClauseStr = whereClauseStr.replace("))",")");
											whereClauseStr = "whereValue:TRUE;whereParam:ST_Intersects(geom, (SELECT ST_MakePolygon(ST_GeomFromText('"+whereClauseStr+"',4326))))";
											whereClauseStr = whereClauseStr.replace(/,/g,'\\,');
											inClauseStr = "idAttribute:1;inSet:1";
											var combinedClauseStr = inClauseStr+";"+whereClauseStr+";forestThreshold:"+forestThreshold+"layerPIN:"+phpVarlayerPIN+";regionNum:"+subDataNum;
											dataLayer.mergeNewParams({viewparams:combinedClauseStr});
										}
									};
								};
								if(selectLayer.features.length>1){
									if (curLanguage==1) {Ext.Msg.alert("Whoops!","Multiple features drawn. Limit is one.");};
									if (curLanguage==2) {Ext.Msg.alert("¡Ay!","Múltiples características dibujadas. Limit es una.");};
									manualSelectOn = false;
								};
							};
							if(selectMode==2){
								manualSelectOn = true;
								var featureList = [];
								Ext.iterate(selectBox.features, function(key, feature) {
									//Need to extract fctt_id value from feature.fid, which also includes workspace and layer name
									featureList.push(feature.fid.replace(dataSourceLayerName.replace(workspaceName+":","")+".",""));
								});
								
								whereClauseStr = 'whereValue:1;whereParam:1';
								inClauseStr = 'idAttribute:'+idAttribute+';inSet:'+featureList;
								inClauseStr = inClauseStr.replace(/,/g,'\\,');
								
								if(featureList.length==0){Ext.Msg.alert("Whoops!","No features selected! Click on features or draw a box to select.");inClauseStr = 'idAttribute:1;inSet:1'; manualSelectOn = false;};
								if (featureList.length==0 & curLanguage==2) {Ext.Msg.alert("¡Ay!","No hay características seleccionadas! Haga clic en las características o dibujar un cuadro para seleccionar.");inClauseStr = 'idAttribute:1;inSet:1';manualSelectOn = false;};
								if(featureList.length>0){
									updateDataLayerParams();
								};								
							}
							Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Select New</div>");
							navigationMode=true;
							selectPolygon.deactivate();
							selectBox.deactivate();
							if(colorSchemeOn){infoHover.activate();}
							infoClick.activate();
							selectLayer.removeAllFeatures();
							prioritizationLayer.setVisibility(false);
							updateStyling();
							dataLayer.redraw();
						};
						updateSelectionButtonLanguage();
					}
				}, "->",
				{xtype: "button", id: 'cancelclearselection', text: "<div style='color:black;font-size: 12'>Clear/Cancel</div>", icon: 'images/clear.gif', hidden: true,
					handler: function() {
						manualSelectOn = false;
						colorSchemeOn = false;
						prioritizationOn=false;
						Ext.getCmp('colorAttribute').getSelectionModel().clearSelections();
						
						var numericindex=Ext.getCmp('regionSelectCombo').store.data.items[Ext.getCmp('regionSelectCombo').selectedIndex].data.field1;
						
						if(numericindex==0){
							inClauseStr="idAttribute:1;inSet:1";
							whereClauseStr="whereParam:1;whereValue:1;";
							updateDataLayerParams();
						};
						if(numericindex>0){
							inClauseStr="idAttribute:1;inSet:1";
							whereClauseStr='whereParam:'+locationParamName+';whereValue:'+numericindex;
							updateDataLayerParams();
						};
						
						Ext.iterate(selectBox.features, function(key, feature) {
								delete selectBox.features[key];
							});
						selectBox.deactivate();
						selectPolygon.deactivate();
						inClauseStr = "idAttribute:1;inSet:1";		
				
						updateStyling();
						updatePrioritization();
						
						if(!navigationMode){
							navigationMode=true;							
							if(colorSchemeOn){infoHover.activate();}
							infoClick.activate();
							selectLayer.removeAllFeatures();
							//Ext.getCmp('cancelclearselection').setText("<div style='color:black;font-size: 12'>Clear</div>");
							Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Begin Selecting</div>");
							Ext.getCmp('cancelclearselection').hide();
						}
						else{
							Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Begin Selecting</div>");
							Ext.getCmp('cancelclearselection').hide();
						};
						updateSelectionButtonLanguage();
					}
				}]
			}			
			]
		};
		
		//DATA LAYER OPTIONS PANEL
		var optionsPanel = {
			id: "optionsPanel",
			title: "DISPLAY OPTIONS",
			collapsible: true,
			//collapsed: true,
			titleCollapse: true,
			layout: 'form',
			//width: 250,
			bodyStyle: 'padding: 2;',
			items: [
				{xtype: "panel", id:'defaultColorPanel', collapsible:true, collapsed: true, titleCollapse: true, style:'padding 0px 0px 10px 0px', title: '<center><div style="color: '+defaultColor+'; font-weight: bold">Default Shape Fill Color</div>',
						listeners:{
							expand: function (p, eOpts ){
							document.getElementById("defaultColorPanel").doLayout
						}},					
						items: [{xtype: "colorpalette", id: "defaultColorPicker", color: 'blue',handler: function(picker, selColor){
							defaultColor=selColor;
							Ext.getCmp('defaultColorPanel').setTitle('<center><div style="color: '+defaultColor+'; font-weight: bold">Default Shape Fill Color</div>');
							if (curLanguage==2) {Ext.getCmp('defaultColorPanel').setTitle('<center><div style="color: '+defaultColor+'; font-weight: bold">Color de Relleno Defecto</div>');};
							Ext.getCmp('defaultColorPanel').collapse();
							updateStyling();
						}}]
				},
				{xtype:'compositefield', fieldLabel: 'Shape lines', id:'shpLinesLabel', items: [{xtype: "checkbox", id:"chkLines", checked:true, handler: function() {linesOn = Ext.getCmp("chkLines").checked; updateStyling();}}]},
				{xtype:'compositefield', fieldLabel: 'Shape fill', id: 'shpFillLabel', items: [{xtype: "checkbox", id:"chkFill", checked:true,handler: function() {selectLayer.setVisibility(Ext.getCmp("chkFill").checked);fillOn = Ext.getCmp("chkFill").checked; updateStyling();}}]},
				{xtype:'compositefield', fieldLabel: 'Opacity', id:'opacityLabel', items: [
					{
						xtype: "gx_opacityslider",
						id: "opacitySlider",
						layer: dataLayer,
						changeVisibility: true,
						aggressive: true,
						vertical: false,
						width: 120,
						value: 65,
						x: 15,
						y: 150,
						plugins: new GeoExt.LayerOpacitySliderTip()
					},
					{xtype: "textfield", id:"blah", width: 0, hidden: true}	//this textfield is in here only because javascript seems to throw an error	if the opacityslider is alone in the compositefield
				]},
				{xtype:'compositefield', fieldLabel: 'Marginality Layer', id: 'margLayerLabel', items: [{xtype: "checkbox", id:"chkMarginality", checked:false, disabled:true, handler: function() {marginalityLayer.setVisibility(Ext.getCmp("chkMarginality").checked); updateStyling();}}]},
				{xtype:'compositefield', fieldLabel: 'Base map type', id: 'basemapLabel', items: [{xtype: "combo", id:"basemapCombo", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 120, listWidth: 200, queryMode:'local', value:'Google Physical', store: [[0,'None'],[1,'Google Physical'],[2,'Google Hybrid'],[3,'Google Satelitte'],[4,'Microsoft Bing Street Map'],[5,'Forest Change(2000-2012)']],  
						listeners: {'select': function(combo, record, index) {
							gphy.setVisibility(index==1);
							ghyb.setVisibility(index==2);
							gsat.setVisibility(index==3);
							gosm.setVisibility(index==4);
							ghan.setVisibility(index==5);
							gosmActive = (index==4);
							ghanActive = (index==5);
							updateOnZoom(app.mapPanel.map.getZoom());
							updateStyling();
						}}
					}]
				},
				{xtype:'compositefield', fieldLabel: 'Show Scale', id:'showScaleLabel', items: [{xtype: "checkbox", id:"chkScale", checked:true,handler: function() {if (!Ext.getCmp("chkScale").checked){app.mapPanel.map.removeControl(scaleControl)};if (Ext.getCmp("chkScale").checked){app.mapPanel.map.addControl(scaleControl = new OpenLayers.Control.ScaleLine({maxWidth: 400}));}}}]},
				{xtype:'compositefield', fieldLabel: 'Pan/Zoom Tool', id: 'panZoomLabel',items: [{xtype: "checkbox", id:"chkPanZoom", checked:true,handler: function() {if (!Ext.getCmp("chkPanZoom").checked){app.mapPanel.map.removeControl(panzoomControl)};if (Ext.getCmp("chkPanZoom").checked){app.mapPanel.map.addControl(panzoomControl  =  new OpenLayers.Control.PanZoom);}}}]},
				{xtype:'compositefield', fieldLabel: 'Mouse wheel zoom', id: 'mouseWheelLabel',items: [{xtype: "checkbox", id:"chkMouseZoom", checked:true,handler: function() {if (!Ext.getCmp("chkMouseZoom").checked){navControl.disableZoomWheel();};if (Ext.getCmp("chkMouseZoom").checked){navControl.enableZoomWheel();}}}]}
			]
		};
		
	   //COLOR BY ATTRIBUTE PANEL
		var colorByAttributePanel = new Ext.Panel({
			id:"colorByAttributePanel",
			title: "TARGETING DATA",
			collapsible: true,
			titleCollapse: true,
			layout: 'form',
			//width: 250,
			labelWidth:95,
			bodyStyle: 'padding: 3;',
			items: [
				{xtype: "panel", id:'lowColorPanel', collapsible: true, collapsed: true, titleCollapse: true, style:'padding:0px 0px 0px 0px', title: '<center><div style="color: '+lowColor+'; font-weight: bold">Low Color</div>',
					listeners:{
						expand: function (p, eOpts ){
						document.getElementById("lowColorPanel").doLayout
					}},
					items: [{xtype: "colorpalette", id: "lowColorPicker", color: 'blue', handler: function(picker, selColor){
						lowColor=selColor;
						Ext.getCmp('lowColorPanel').setTitle('<center><div style="color: '+lowColor+'; font-weight: bold">Low Color</div>');
						if (curLanguage==2) {Ext.getCmp('lowColorPanel').setTitle('<center><div style="color: '+lowColor+'; font-weight: bold">Color Bajo</div>');};
						Ext.getCmp('lowColorPanel').collapse();
						Ext.getCmp('highColorPanel').expand();				
						updateStyling();
					}}]
				},
				{xtype: "panel", id:'highColorPanel', collapsible: true, collapsed: true, titleCollapse: true, style:'padding:0px 0px 10px 0px', title: '<center><div style="color: '+highColor+'; font-weight: bold">High Color</div>', 
					listeners:{
						expand: function (p, eOpts ){
						document.getElementById("highColorPanel").doLayout
					}},
					items: [{xtype: "colorpalette", id: "highColorPicker", color: 'red', handler: function(picker, selColor){
						highColor=selColor;
						Ext.getCmp('highColorPanel').setTitle('<center><div style="color: '+highColor+'; font-weight: bold">High Color</div>');
						if (curLanguage==2) {Ext.getCmp('highColorPanel').setTitle('<center><div style="color: '+highColor+'; font-weight: bold">Color Alto</div>');};
						Ext.getCmp('highColorPanel').collapse();
						Ext.getCmp('highColorPanel').expand();
						updateStyling();
					}}]
				},
				//A "compositefield" object allows a label to be coupled with a form control, such as a textbox
				{xtype:'compositefield', fieldLabel: 'Method', id: 'methodLabel', items: [{xtype: "combo", id:"methodCombo", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 115, queryMode:'local', value:'Interpolate', store: [[0,'Interpolate'],[1,'Quantiles']],listeners: {'select': function(combo, record, index){updateStyling();Ext.getCmp('numQuantiles').setDisabled(index==0)}}}]},								
				{xtype:'compositefield', fieldLabel: '# Quantiles', id: 'quantilesLabel', disabled:true, items: [{xtype: "numberfield", id:"numQuantiles", width: 40, value:'3', listeners: {change: function(){updateStyling();}}}]},								
				//{xtype:'compositefield', fieldLabel: 'Where',items: [{xtype: "combo", id:"whereCombo", disabled: true, selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 120, queryMode:'local', value:'Everywhere', store: locationData}]},
				//{xtype: 'container', layout: 'hbox', layoutConfig: {pack:'center',align: 'center'}, items:[
				new Ext.grid.GridPanel({
						id: "colorAttribute",
						title: "Variables",
						//style:'padding:0px 0px 10px 0px',
						//margin: '0 2 0 0',
						store: prioritizationVariables,
						cm: new Ext.grid.ColumnModel([
								{id: "displayName", dataIndex: "displayName", sortable: true},
								]),
						sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
						autoExpandColumn: "displayName",
						//listeners: {
						//	selectionchange: function(view, selections, options) {
						//		colorSchemeOn = true;
						//		updateStyling();
						//	}
						//},
						height: 200
				}),
				{xtype:'compositefield', fieldLabel: 'Show null values', id:'chkNullLabel', items: [{xtype: "checkbox",  id:"chkNull", boxLabel: "(in default color)", checked:false, handler: function() {updateStyling();}}]},
				//]},
			],
				bbar: [
					//not using an update button anymore, instead auto-updating on click or keypress (see below).  So, keeping this button with hidden:true
					{id: 'updatedatavis', hidden: false, text: "<div style='color:green; font-weight: bold;font-size: 12'>Update Data Visualization</div>", cls: 'boldbutton',icon: 'images/refresh.gif',
						handler: function() {
						colorSchemeOn = true;
						infoHover.activate();
						updateStyling();
						}},
					"->",
					{id: 'cleardatavis', text: "<div style='color:black;font-size: 12'>Clear</div>",icon: 'images/clear.gif',
					handler: function() {
						colorSchemeOn = false;
						infoHover.deactivate();
						updateStyling();
					}
				}]
		});
			
		//add a function to return a selectedIndex for the gridPanel.  Found this in sencha forum.Thanks dude!
		Ext.grid.RowSelectionModel.override ({
			getSelectedIndex : function(){
				return this.grid.store.indexOf( this.selections.itemAt(0) );
			}
		});		
				
		//updatestyling on user click or keypress in Attribute list:		
		/*
		Ext.getCmp("colorAttribute").on('rowclick', function() {
				app.mapPanel.body.dom.style.cursor = 'wait';
				imgWait.style.visibility = 'visible';
				
				colorSchemeOn = true;
				infoHover.activate();
				updateStyling();
            }, this);		
		Ext.getCmp("colorAttribute").on('beforerowselect', function() {
			//alert("hi!");
			}, this);		
		Ext.getCmp("colorAttribute").on('keydown', function(e) {
				//this event captures *before* the selection actually updates, even though the visualation updates to the new selection.  So, we have to deal with that by catching whether there was an up or down press and temporarily modifying the selection
				if(e.keyCode==38){
					//up key
					var previousIndex=Ext.getCmp('colorAttribute').getSelectionModel().getSelectedIndex();
					//it doesn't appear necessary to catch the 0 and max index cases, but doing it anyways for robustness
					if(previousIndex>0){
						Ext.getCmp('colorAttribute').getSelectionModel().selectRow(previousIndex-1)
							updateStyling();
						Ext.getCmp('colorAttribute').getSelectionModel().selectRow(previousIndex)       
					}
				}
				if(e.keyCode==40){
					//down key
					var previousIndex=Ext.getCmp('colorAttribute').getSelectionModel().getSelectedIndex();
					if(previousIndex<Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].store.totalLength-1){
						Ext.getCmp('colorAttribute').getSelectionModel().selectRow(previousIndex+1)
							updateStyling();
						Ext.getCmp('colorAttribute').getSelectionModel().selectRow(previousIndex)
					}
				}
				
				}, this);
		*/
		
		//SELECT BY EXPECTED BENEFIT TO COST RATIO PANEL
		var selectPanel = new Ext.Panel({
			xtype: "panel",
			id:"selectPanel",
			title: "TARGET",
			layout: "form",
			//width: 250,
			layoutConfig: {multi: true},
			collapsible: true,
			collapsed: false,
			titleCollapse: true,
			bodyStyle: 'padding: 3;',
			items: [
				{xtype: "fieldset", id:"chooseBenefits", title: 'Choose Benefit Variables', collapsible:false, hidden:false, labelWidth: 75,
					items: [
						{xtype:'compositefield', fieldLabel: 'Carbon:', id: 'carbonBenefitLabel', items: [{xtype: "combo", id:"carbonBenefitChoose", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 115, listWidth:150, queryMode:'local', value:'Non-soil carbon', store: [['carbon','Non-soil carbon'],['carbon_total','Total carbon'],['carbon_soil','Carbon in soil']],  
							columns: [
								{header: 'field1',  dataIndex: 'field1'},
								{header: 'field2', dataIndex: 'field2'}
							]						
						}]
						},
						{xtype:'compositefield', fieldLabel: 'Biodiversity:', id: 'bioBenefitLabel', items: [{xtype: "combo", id:"bioBenefitChoose", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', width: 115, listWidth:150, queryMode:'local', value:'Global RWRI', store: [['bio','Global RWRI'],['bio_loc','National RWRI'],['bio_count','Threat. species count']],  
							columns: [
								{header: 'field1',  dataIndex: 'field1'},
								{header: 'field2', dataIndex: 'field2'}
							]						
						}]
						}
					]
				},
				{xtype: "fieldset", id:"priorityBudget", title: 'Choose Budget', collapsible:false,
					items: [
						{layout: 'hbox', unstyled: true, items: [
							{xtype: "radio", id: "percentageRadio", checked:true, boxLabel:"Percentage of total:", 
								listeners: {check: function (ctl, val) {
									if (val) {Ext.getCmp('rawRadio').setValue(false);Ext.getCmp('budget_percentage').setDisabled(false);Ext.getCmp('budget_raw').setDisabled(true)};
								}}
							},
							{xtype: 'spacer', width: 3},{xtype: "numberfield", id:"budget_percentage", width: 30, value: "10"},{xtype: 'spacer', width: 3},{xtype:"label",text:"(%)"}]},		
						{layout: 'hbox', unstyled: true, style:'padding:10px 0px 0px 0px', items: [
							{xtype: "radio", id: "rawRadio", boxLabel: "Raw budget:",
								listeners: {check: function (ctl, val) {
									if (val) {Ext.getCmp('percentageRadio').setValue(false);Ext.getCmp('budget_percentage').setDisabled(true);Ext.getCmp('budget_raw').setDisabled(false)};
								}}
							},
							{xtype: 'spacer', width: 3},{xtype: "numberfield", id:"budget_raw", width: 67, value: "10000000", disabled:true},{xtype: 'spacer', width: 3},{xtype:"label",id:"currencyLabel",text:"($)"}]},		
					]
				},
				{xtype: "tabpanel", id:'benefitTabPanel', activeTab: 0, plain:true, items:[
					{id: "combineTab", title: "Weight Benefits", padding:5, autoHeight: true, items:[
						{layout: 'auto', unstyled: true, items: [							
							{layout: 'form', unstyled: true, items: [
								{xtype: 'spacer', width: 17},
								{xtype:'compositefield', id: 'carbonweightfield', fieldLabel: '<div style="color: green; font-weight: bold">Carbon:</div>', labelSeparator: "", items: [{xtype: "numberfield", decimalPrecision:2, id:"weight1", width: 40, value: ".33", listeners: {change: function(){Ext.getCmp('weightMultiSlider').setValue(0, Ext.getCmp('weight1').value*100)}}}]},
							]},
							{layout: 'form', unstyled: true, items: [
								{xtype: 'spacer', width: 17},
								{xtype:'compositefield', id: 'bioweightfield', fieldLabel: '<div style="color: red; font-weight: bold">Biodiversity:</div>', labelSeparator: "", items: [{xtype: "numberfield", decimalPrecision:2, id:"weight2", width: 40, value: ".33", listeners: {change: function(){Ext.getCmp('weightMultiSlider').setValue(1, Ext.getCmp('weightMultiSlider').getValues()[0]+Ext.getCmp('weight2').value*100)}}}]},
								
							]},
							{layout: 'form', unstyled: true, items: [
								{xtype: 'spacer', width: 17},
								{xtype:'compositefield', id: 'hydroweightfield', fieldLabel: '<div style="color: blue; font-weight: bold">Hydrological:</div>', labelSeparator: "", items: [{xtype: "numberfield", decimalPrecision:2, id:"weight3", width: 40, value: ".33", listeners: {change: function(){Ext.getCmp('weightMultiSlider').setValue(1, 100*(1-Ext.getCmp('weight3').value))}}}]}
							]}
						]},
						new Ext.slider.MultiSlider(
							{id: 'weightMultiSlider', values: [33,66], increment: 1, minValue: 0, maxValue: 100, constrainThumbs: true, width:215, plugins: [new Ext.ux.slider.Highlight()], 
								listeners: {
									change: function(slider, newValue, thumb){
										if(thumb.index==0){
											Ext.getCmp('weight1').setValue(slider.getValues()[0]/100);
											Ext.getCmp('weight2').setValue((slider.getValues()[1]-slider.getValues()[0])/100);
										}
										if(thumb.index==1){
											Ext.getCmp('weight2').setValue((slider.getValues()[1]-slider.getValues()[0])/100);
											Ext.getCmp('weight3').setValue((100-slider.getValues()[1])/100);
										}
									}
								}
						}),
						{xtype: "panel", id:'selectedFillColorPanel', collapsible:true, collapsed: true, titleCollapse: true, style:'padding 0px 0px 10px 0px', title: '<center><div style="color: '+selectedFillColor+'; font-weight: bold">Selected Shape Fill Color</div>',
								items: [{xtype: "colorpalette", id: "selectedFillColorPicker", color: 'blue',handler: function(picker, selColor){
								selectedFillColor=selColor;
								Ext.getCmp('selectedFillColorPanel').setTitle('<center><div style="color: '+selectedFillColor+'; font-weight: bold">Selected Shape Fill Color</div>');
								if (curLanguage==2) {Ext.getCmp('selectedFillColorPanel').setTitle('<center><div style="color: '+selectedFillColor+'; font-weight: bold">Color de Relleno Seleccionado</div>');};
								Ext.getCmp('selectedFillColorPanel').collapse();
								if(prioritizationLayer.visibility){updatePrioritization();};
							}}]
						}				
						]
					},
					{id: "compareTab", title: "Compare", height:100, layout: {type: "hbox", pack: 'center', align: 'middle'}, padding:2, items:[
						{xtype: "combo", id:"compareObjectiveCombo", selectedIndex:0, allowBlank:false, editable: false, triggerAction: 'all', queryMode:'local', width: 150, value:'All Benefits', store: [[0,'All Benefits'],[1,'Carbon and Biodiversity'],[2,'Carbon and Hydro'],[3,'Biodiversity and Hydro']],
						listeners: {'select': function(combo, record, index) {	
							if(prioritizationLayer.visibility){updatePrioritization();};
						}}}
					]}
				]},
				{xtype: "fieldset", id:"priorityOptions", title: 'Options', layout: 'form', labelWidth: 170, collapsible:false,
					items: [
						//{layout: 'vbox', unstyled: true, items: [
						{xtype:'compositefield', fieldLabel: 'Scale benefits by deforestation risk', id:'chkRiskLabel', items: [{xtype: "checkbox", id:"chkRisk", checked:true}]},
						{xtype:'compositefield', fieldLabel: 'Divide expected benefits by cost', id:'chkCostLabel', items: [{xtype: "checkbox", id:"chkCost", checked:true}]},
						{xtype:'compositefield', fieldLabel: 'Scale total costs by forest area', id:'chkAreaLabel', items: [{xtype: "checkbox", id:"chkArea", checked:true}]},
						{xtype:'compositefield', fieldLabel: 'Normalize benefits by mean instead of median', id:'chkMeanLabel', items: [{xtype: "checkbox", id:"chkMean", listeners: {change: function (checkbox, newVal, oldVal){
							if(curLanguage==1 && newVal){Ext.Msg.alert("Warning", "Normalizing by the mean rather than the median may make prioritization results particularly sensitive to outliers. (If you just clicked Submit, you may need to click again).");};
							if(curLanguage==2 && newVal){Ext.Msg.alert("Aviso", "La normalización de la media en lugar de la mediana puede hacer que los resultados de priorización particularmente sensible a los valores atípicos. (Si usted acaba de hacer clic en Entregar, es posible que tenga que hacer clic de nuevo).");};
						}}}]},
						{xtype:'compositefield', fieldLabel: 'Opacity:', id:'priorityOpacityLabel',items:[{xtype: "textfield", id:"blah", width: 0, hidden: true}]},
						{
							xtype: "gx_opacityslider",
							id: "priorityOpacitySlider",
							layer: prioritizationLayer,
							//changeVisibility: true,
							aggressive: true,
							vertical: false,
							width: 200,
							value: 90,
							x: 15,
							y: 150,
							plugins: new GeoExt.LayerOpacitySliderTip()
						}
						//]
						//}
					]
				}
			],
			bbar: [{id: 'submitprioritization', text: "<div style='color:green; font-weight: bold;font-size: 12'>Submit/Update</div>", cls: 'boldbutton',icon: 'images/submit.gif',
					handler: function() {
						prioritizationLayer.setVisibility(true);
						updatePrioritization();
				}}, "->",
				{id: 'clearprioritization', text: "<div style='color:black;font-size: 12'>Clear</div>", cls: 'boldbutton',icon: 'images/clear.gif',
					handler: function() {
						prioritizationLayer.setVisibility(false);
						updateStyling();
					}
				}]
		});
		
		//EXPORT PANEL
		var exportPanel = {
			id: "exportPanel",
			title: "EXPORT",
			collapsible: true,
			collapsed: true,
			titleCollapse: true,
			layout: 'form',
			hidden: false,
			//width: 250,
			bodyStyle: 'padding: 2;',
			items: [
				{xtype: 'button',
				text:"<div style='color:black;font-size: 12'>Export Shapefile</div>",
				id: 'shapefileButton', 
				scale: 'medium',
				icon: 'images/download_shp.png',
				handler: function() {
						
						//var config = {"method":"GET", "async":false};
						//config.url = "../../geoserver/forestro_ws/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=forestro_ws:data_prioritize&viewParams="+priorityParams+"&outputFormat=SHAPE-ZIP";
						//var xmlhttp = OpenLayers.Request.issue(config);													
						
						if((userLayerActive && userDataSourceUOA=="mex_pred") || dataSourceNum == 1 || dataSourceNum==2) {
							if(curLanguage==1){
								alert("Unfortunately, shapefile download is not possible for datasets that use the Mexico predios. However, you can download your data and prioritization results in CSV format, including predio names.");
							}
							if(curLanguage==2){
								alert("Desafortunadamente, descarga shapefile no es posible para los conjuntos de datos que utilizan los predios México. Sin embargo, puede descargar los datos y resultados de priorización en formato CSV, incluyendo los nombres de predios.");
							}
						}
						else{						
							var downloadURL="";
												
							updatePrioritization();
							if(!prioritizationLayer.visibility){
								if(curLanguage==1){Ext.Msg.alert('','You must run the prioritization tool before downloading the results.')};
								if(curLanguage==2){Ext.Msg.alert('','Necesita ejecutar la herramienta "Focalizar" antes de descargar los resultados.')};
							}
							else {	
								if(userLayerActive){
									downloadURL='../../geoserver/'+workspaceName+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+workspaceName+':data_prioritize_userdata&outputFormat=SHAPE-ZIP&format_options=filename:fctt_output.zip';
								}
								else{
									downloadURL='../../geoserver/'+workspaceName+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+workspaceName+':data_prioritize&outputFormat=SHAPE-ZIP&format_options=filename:fctt_output.zip';
								}
								
								imgWait.style.visibility = 'visible';
									var form = document.createElement("form");
									form.method = "POST";
									form.action = downloadURL;	
									
									var input = document.createElement("input");
										input.type = "hidden";
										input.name = "viewParams";
										input.value = priorityParams;
										form.appendChild(input);
		
									//http://jsfiddle.net/expedio/vjasu3k8/
									
									document.body.appendChild(form);
									form.submit();
									//window.location = downloadURL;
								imgWait.style.visibility = 'hidden';
							}
						}
					}
				},
				{xtype: 'button',
				text:"<div style='color:black;font-size: 12'>Export CSV</div>",
				id: 'csvButton',
				scale: 'medium',
				icon: 'images/download_csv.png',
				handler: function() {
						var downloadURL="";
											
						updatePrioritization();
						if(!prioritizationLayer.visibility){
							if(curLanguage==1){Ext.Msg.alert('','You must run the prioritization tool before downloading the results.')};
							if(curLanguage==2){Ext.Msg.alert('','Necesita ejecutar la herramienta "focalizar" antes de descargar los resultados.')};
						}
						else {						
							if(userLayerActive){
								downloadURL='../../geoserver/'+workspaceName+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+workspaceName+':data_prioritize_userdata&outputFormat=csv';
							}
							else{
								downloadURL='../../geoserver/'+workspaceName+'/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+workspaceName+':data_prioritize&outputFormat=csv';
							}
							
							var geomClause = "";
							
							//Omit geometry column because it usually screws up CSV
							//if((userLayerActive && userDataSourceUOA=="mex_pred") || dataSourceNum == 1 || dataSourceNum==2) {
								geomClause = ";geomZero:0";
							//}
								
							imgWait.style.visibility = 'visible';
								var form = document.createElement("form");
								form.method = "POST";
								form.action = downloadURL;	
								
								var input = document.createElement("input");
									input.type = "hidden";
									input.name = "viewParams";
									input.value = priorityParams+geomClause;
									form.appendChild(input);
	
								//http://jsfiddle.net/expedio/vjasu3k8/
								
								document.body.appendChild(form);
								form.submit();
								//window.location = downloadURL;
							imgWait.style.visibility = 'hidden';
						}
					}
				},
				{xtype: "button",
				id: "printButton",
				text: "<div style='color:black;font-size: 12'>Print/PDF</div>", 
				scale: 'medium',
				icon: 'images/print.png',
				hidden: false,
				handler: function() {	

						if(isIE==true){
							if(curLanguage==1){alert("Printing functionality is only supported in the Chrome and Firefox browsers at this time, not Internet Explorer. Please use one of these other browsers to access this feature.")};
							if(curLanguage==2){alert("La funcionalidad de impresión sólo se admite en los navegadores Chrome y Firefox en este momento, no Internet Explorer. Por favor, use uno de estos navegadores otras para acceder a esta función.")};
						}
						else{
						
							if((gosm.getVisibility()==true)&(curLanguage==1)){alert("Note: at this time, the Microsoft Bing basemap is not supported for printing to PDF.")};
							if((gosm.getVisibility()==true)&(curLanguage==2)){alert("Nota: en este momento, el mapa base Microsoft Bing no se admite para imprimir en PDF")};
						
							if(Ext.getCmp('printDialog')){Ext.getCmp('printDialog').destroy()};
							
							if(curLanguage==1){
								var printDialog = new Ext.Window({
									autoHeight: true,
									width: 350,
									resizeable: false,
									id: 'printDialog',
									title: "Configure Print",
									items: [new GeoExt.PrintMapPanel({
										sourceMap: app.mapPanel,
										legend: legendPanel,
										printProvider: printProvider
									})],
									bbar: [{
										id: 'createPDFIcon',
										text: "Create PDF",
										handler: function() {
											
											if(ghan.getVisibility()==true & printDialog.items.get(0).currentZoom>8){
												alert("Warning: the Forest Change basemap will not print at the current zoom level. To include the Forest Change basemap, please zoom out.");
											}
											
											if(ghan.getVisibility()==true){printProvider.customParams.attributionText="Basemap: Hansen et al. 2014";};
											if(gosm.getVisibility()==true&&curLanguage==1){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
											if(gosm.getVisibility()==true&&curLanguage==2){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
											
											printDialog.items.get(0).print({legend: legendPanel});
										}
									}]
								});
								printDialog.show();								
							}
							
							if(curLanguage==2){
								var printDialog = new Ext.Window({
									autoHeight: true,
									//height: 200,
									width: 450,
									resizeable: false,
									id: 'printDialog',
									title: "Configure Imprimir",
									items: [new GeoExt.PrintMapPanel({
										sourceMap: app.mapPanel,
										legend: legendPanel,
										printProvider: printProvider
									})],
									bbar: [{
										id: 'createPDFIcon',
										text: "Crear PDF",
										handler: function() {
											
											if(ghan.getVisibility()==true & printDialog.items.get(0).currentZoom>8){
												alert("Advertencia: Cambiar el mapa base del bosque no se imprimirá en el nivel de zoom actual. Para incluir el basemap de Cambia Forestal, por favor disminuir el zoom.");													
											}
																					
											if(ghan.getVisibility()==true){printProvider.customParams.attributionText="Basemap: Hansen et al. 2014";};
											if(gosm.getVisibility()==true&&curLanguage==1){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
											if(gosm.getVisibility()==true&&curLanguage==2){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
											
											printDialog.items.get(0).print({legend: legendPanel});											
										}
									}]
								});
								printDialog.show();
							}
						}
						
			
						if(1==2){
							//For some reason printing prioritizationLayer with the predefined SLD styles (mredd_prioritize_CB etc...) throws an error unless selectLayer has at least one feature in it.  Weird. So, I'm adding this point at 0,0 if necessary to avoid this problem.
							//On the other hand, printing fails if colorSchemeLegendLayer has its one dummy shape, so we remove that either way
							//dataLayer.mergeNewParams({sld_body: null}); //styles: "default_fctt",
							
							//feature.geometry.transform("EPSG:900913","EPSG:4326");
							//aliasproj = new OpenLayers.Projection("EPSG:900913"); 
							//dataLayer.projection = aliasproj;
							
							//http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=topp:states
								//var config = {"method":"GET", "async":false};
								//config.url="../../geoserver/wms?request=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=";
								//config.user="registereduser";
								//config.password=phpVarGeoServerLogin;
								//var xmlhttp = OpenLayers.Request.issue(config);
								
							//alert(Object.keys(legendPanel));
						
			
						
							//alert(marginalityLegendLayer.getVisibility());
							
							//colorSchemeLegendLayer.setVisibility(false);
							//marginalityLegendLayer.setVisibility(false);
							//prioritizationLegendLayer.setVisibility(false);
							
							//if (selectLayer.features.length==0){
							//	var tempPointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(0,0))
							//	selectLayer.addFeatures([tempPointFeature]);
							//	colorSchemeLegendLayer.removeAllFeatures();
							//	printPage.fit(app.mapPanel, true);
							//	printProvider.print(app.mapPanel, printPage,{legend: legendPanel});
							//	colorSchemeLegendLayer.addFeatures(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.Point(0, 0))));
							//	selectLayer.removeFeatures(tempPointFeature)
							//}
							//else {
								//colorSchemeLegendLayer.removeAllFeatures();
								//selectLayer.setVisibility(false);
								if(ghan.getVisibility()==true){printProvider.customParams.attributionText="Basemap: Hansen et al. 2014";};
								if(gosm.getVisibility()==true&&curLanguage==1){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
								if(gosm.getVisibility()==true&&curLanguage==2){printProvider.customParams.attributionText="Basemap: © Microsoft Bing. Microsoft product screen shot(s) reprinted with permission from Microsoft Corporation";};
								
								printPage.fit(app.mapPanel, true);
								printProvider.print(app.mapPanel, printPage,{legend: legendPanel});
								//colorSchemeLegendLayer.addFeatures(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.Point(0, 0))));
							//}
							
							//colorSchemeLegendLayer.setVisibility(true);
							//marginalityLegendLayer.setVisibility(true);
							//prioritizationLegendLayer.setVisibility(true);
						}
					}
				}
			]
		};

	toolItems.push(optionsPanel, regionPanel, colorByAttributePanel, selectPanel, exportPanel);	
	
	
//---------------------------------        ADDITIONAL FUNCTIONS              --------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

function updateStyling() {

	//app.mapPanel.body.dom.style.cursor = 'wait';
	//imgWait.style.visibility = 'visible';
	
	if(Ext.getCmp('colorAttribute').getSelectionModel().selections.items.length==0){Ext.getCmp('colorAttribute').getSelectionModel().selectRow(0);}
	
	var theAttribute = Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name;
	
	if(colorSchemeOn==true & (dataSourceNum==4 | dataSourceNum==6 | dataSourceNum==7) & manualSelectOn == false){
		if(curLanguage==1){Ext.Msg.alert("Warning", "To work with this layer, you must first select a smaller region using the DEFINE STUDY AREA panel.");};
		if(curLanguage==2){Ext.Msg.alert("Aviso", "Para trabajar con esta capa, primero debe seleccionar una región más pequeña utilizando el panel DEFINIR ÁREA DE ESTUDIO.");};			
		colorSchemeOn=false;
		updateStyling();
		app.mapPanel.body.dom.style.cursor = 'pointer';
		imgWait.style.visibility = 'hidden';
		Ext.getCmp('colorAttribute').getSelectionModel().clearSelections();
	}
	else {
		
		//If selected variable is deforestation, multiply by 100 to get numbers in percentage form
		var displayFactor = 1;
		if(theAttribute=="risk"){displayFactor=100;};

		var rulesForLegend = [];
				
		//Create SLD styling code and attach to dataLayer layer, based on user-specified options
				
		//Create object to handle HTTP requests to the server
		var config = {"method":"GET", "async":false};
			
		//Beginning of SLD document
		var newSLD = '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+dataSourceLayerName+'</sld:Name><sld:UserStyle><sld:FeatureTypeStyle>';
		var newSLDForLegend = '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':dummyDataLayerForWMSLegend</sld:Name><sld:UserStyle><sld:Title>'+workspaceName+':dummyDataLayerForWMSLegend</sld:Title><sld:FeatureTypeStyle>';

		//generate a bit of SLD code that we'll use a few times to filter for non-null values
		var notNullFilterSLD='<ogc:Filter><ogc:Not><ogc:PropertyIsNull><ogc:PropertyName>'+theAttribute+'</ogc:PropertyName></ogc:PropertyIsNull></ogc:Not></ogc:Filter>';			
		
				//If user chose to color by quantiles
				if (Ext.getCmp('methodCombo').selectedIndex==1 & colorSchemeOn & fillOn){
					
					//Force numQuantiles textbox text to be integer, and store value to numQuants variable
					Ext.getCmp('numQuantiles').setValue(parseInt(Ext.getCmp('numQuantiles').getValue()));
					if (!(Ext.getCmp('numQuantiles').getValue()>0)){Ext.getCmp('numQuantiles').setValue("10")};
					var numQuants = parseInt(Ext.getCmp('numQuantiles').getValue());
					
					//Loop through the quantiles and get the thresholds	from getQuantiles SQL query		
					updateDataLayerParams();
					var thresholds = []		
					for (var i=1; i<numQuants; i++){
					
						if(userLayerActive){					
							var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getQuantile_userdata";
							var firstParams = "theAttribute:"+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+";layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName;
						}
						else{
							var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getQuantile";
							var firstParams = "theAttribute:"+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+";dataSource:"+dataSourceName
						}
							
						updateDataLayerParams();					
						var params = preParams+"&viewparams="+firstParams+';'+theViewParams+";percentage:"+i/numQuants;					
						
						var response = new XMLHttpRequest();
							response.open( "POST","../../geoserver/"+workspaceName+"/ows",false);
							response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						response.send(params);
						if (byTagNS(response.responseXML,"value",workspaceName)){
							//console.log(response.responseText)
							thresholds.push(Number(byTagNS(response.responseXML,"value",workspaceName)));
						}
						else {
							//Try sending again without final viewParams if not sucessful
								var params = preParams+"&viewparams="+firstParams+";percentage:"+i/numQuants;
								response.open( "POST","../../geoserver/"+workspaceName+"/ows",false);
								response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
								response.send(params);
								if(curLanguage==1){Ext.Msg.alert("Warning", "Due to a problem communicating with the server, the quantiles used may not precisely reflect the quantiles of "+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+" for your exact region of interest.");};
								if(curLanguage==2){Ext.Msg.alert("Aviso", "Debido a un problema de comunicación con el servidor, los cuantiles utilizados pueden no reflejar con precisión los cuantiles de "+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+" para su región exacta de interés.");};
								if (byTagNS(response.responseXML,"value",workspaceName)){						
									thresholds.push(Number(byTagNS(response.responseXML,"value",workspaceName)));
								}
								else{						
									thresholds.push(0);
								}
						}
					}	
					
					//First threshold rule
					newSLD+='<sld:Rule><Title>Below '+cleanUpIfNumber(thresholds[0])+'</Title>'+notNullFilterSLD+'<ogc:Filter><ogc:PropertyIsLessThan><ogc:PropertyName>'+theAttribute+'</ogc:PropertyName><ogc:Literal>'+thresholds[0]+'</ogc:Literal></ogc:PropertyIsLessThan></ogc:Filter><PolygonSymbolizer><Fill><CssParameter name="fill">#'+lowColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
					if (curLanguage==1){newSLDForLegend+='<sld:Rule><Title>Below '+cleanUpIfNumber(thresholds[0]*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#'+lowColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';};
					if (curLanguage==2){newSLDForLegend+='<sld:Rule><Title>Menos de '+cleanUpIfNumber(thresholds[0]*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#'+lowColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';};
					if (linesOn){newSLD+='<sld:Stroke/>';newSLDForLegend+='<sld:Stroke/>'};
					newSLD+='</PolygonSymbolizer></sld:Rule>'; newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
									
					//"Middle" threshold rules
					for (var i=1; i<numQuants-1; i++){
						newSLD+='<sld:Rule><Title>['+cleanUpIfNumber(thresholds[i-1]*displayFactor)+', '+cleanUpIfNumber(thresholds[i]*displayFactor)+']'+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title>'+notNullFilterSLD;
						newSLDForLegend+='<sld:Rule><Title>['+cleanUpIfNumber(thresholds[i-1]*displayFactor)+', '+cleanUpIfNumber(thresholds[i]*displayFactor)+']'+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title>';
						//Don't need to add filter rules to newSLDForLegend (and this would waste URL length, which is a limiting factor around 8000. getLegendGraphic doesn't support POST requests)
						newSLD+='<ogc:Filter><ogc:And><ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'+theAttribute +'</ogc:PropertyName><ogc:Literal>'+thresholds[i-1]+'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>';
						newSLD+='<ogc:PropertyIsLessThan><ogc:PropertyName>'+theAttribute +'</ogc:PropertyName><ogc:Literal>'+thresholds[i]+'</ogc:Literal></ogc:PropertyIsLessThan></ogc:And></ogc:Filter>';
						newSLD+='<PolygonSymbolizer><Fill><CssParameter name="fill">'+mixLowAndHighColors(i/(numQuants-1))+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						newSLDForLegend+='<PolygonSymbolizer><Fill><CssParameter name="fill">'+mixLowAndHighColors(i/(numQuants-1))+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						if (linesOn){newSLD+='<sld:Stroke/>';newSLDForLegend+='<sld:Stroke/>'};
						newSLD+='</PolygonSymbolizer></sld:Rule>';newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
					}					

					//Final threshold rule
					newSLD+='<sld:Rule><Title>At least '+cleanUpIfNumber(thresholds[numQuants-2])+'</Title>'+notNullFilterSLD+'<ogc:Filter><ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'+theAttribute+'</ogc:PropertyName><ogc:Literal>'+thresholds[numQuants-2]+'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo></ogc:Filter><PolygonSymbolizer><Fill><CssParameter name="fill">#'+highColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
					if (curLanguage==1){newSLDForLegend+='<sld:Rule><Title>Above '+cleanUpIfNumber(thresholds[numQuants-2]*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#'+highColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';};
					if (curLanguage==2){newSLDForLegend+='<sld:Rule><Title>Mas de '+cleanUpIfNumber(thresholds[numQuants-2]*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#'+highColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';};
					if (linesOn){newSLD+='<sld:Stroke/>';newSLDForLegend+='<sld:Stroke/>'};
					newSLD+='</PolygonSymbolizer></sld:Rule>'; newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
		
				};
											
				//If user chose to color by interpolation
				if (Ext.getCmp('methodCombo').selectedIndex<1 & colorSchemeOn & fillOn){			
						//First get max, mean and min values to set calibrate color scale, by HTTP request to the Geoserver SQL View: forestro_ws:getMaxAvgMinwhere
						if(userLayerActive){
							var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getMaxAvgMinWhere_userdata";
							var firstParams = "theAttribute:"+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+";layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName;
						}
						else{
							var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getMaxAvgMinWhere";
							var firstParams = "theAttribute:"+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+";dataSource:"+dataSourceName
						}
										
						updateDataLayerParams();					
						var params = preParams+"&viewparams="+firstParams+';'+theViewParams;
						
						//app.mapPanel.body.dom.style.cursor = 'wait';
						//imgWait.style.visibility = 'visible';
						//app.mapPanel.disable();
						//setTimeout(app.mapPanel.disable(),50);
						//var foo = window.getComputedStyle(document.getElementById('map'), null);
						//var bar = document.getElementById('imgzoomeng').offsetHeight;
						
						//document.createElement("IMG")
			
						//instructionsWindow.show();
						
						var response = new XMLHttpRequest();
							//response.open( "POST","../../geoserver/"+workspaceName+"/ows",true);
							response.open( "POST","../../geoserver/"+workspaceName+"/ows",false);
							response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							response.send(params);
							
							//response.addEventListener("readystatechange", processRequest, false);
							
						if (byTagNS(response.responseXML,"max",workspaceName)){
							minVal = Number(byTagNS(response.responseXML,"min",workspaceName));
							avgVal = Number(byTagNS(response.responseXML,"avg",workspaceName));
							maxVal = Number(byTagNS(response.responseXML,"max",workspaceName));
						}
						else {
							//Try sending again without final viewParams if not sucessful
								var params = preParams+"&viewparams="+firstParams;
								response.open( "POST","../../geoserver/"+workspaceName+"/ows",false);
								response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
								response.send(params);
								if(curLanguage==1){Ext.Msg.alert("Warning", "Due to a problem communicating with the server, the high and low values displayed in the legend may not reflect the maximum and minimum values for your exact region of interest.");};
								if(curLanguage==2){Ext.Msg.alert("Aviso", "Debido a un problema de comunicación con el servidor, los valores altos y bajos que se muestran en la leyenda no siempre son representativas de los valores máximo y mínimo para su región de interés exacta.");};
								if (byTagNS(response.responseXML,"max",workspaceName)){
									minVal = Number(byTagNS(response.responseXML,"min",workspaceName));
									avgVal = Number(byTagNS(response.responseXML,"avg",workspaceName));
									maxVal = Number(byTagNS(response.responseXML,"max",workspaceName));
								}
								else{						
									minVal=0;
									avgVal=0.5;
									maxVal=1;
								}
						}
							
						//app.mapPanel.body.dom.style.cursor = 'pointer';
						//imgWait.style.visibility = 'hidden';							
						//app.mapPanel.enable();
						
						//Apply interpolation color scheme, using SLD Interpolate transformation function	
						newSLD+='<sld:Rule>'+notNullFilterSLD+'<PolygonSymbolizer><Fill><CssParameter name="fill-opacity">1</CssParameter><CssParameter name="fill"><ogc:Function name="Interpolate"><ogc:PropertyName>'+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.name+'</ogc:PropertyName>';
						newSLD+='<ogc:Literal>'+minVal+'</ogc:Literal><ogc:Literal>#'+lowColor+'</ogc:Literal>';			
						newSLD+='<ogc:Literal>'+avgVal+'</ogc:Literal><ogc:Literal>'+mixLowAndHighColors(0.5)+'</ogc:Literal>';
						newSLD+='<ogc:Literal>'+maxVal+'</ogc:Literal><ogc:Literal>#'+highColor+'</ogc:Literal>';
						newSLD+='<ogc:Literal>color</ogc:Literal><ogc:Literal>cubic</ogc:Literal></ogc:Function>';
						
						if(curLanguage==1){newSLDForLegend+='<sld:Rule><sld:Title>Low Value: '+cleanUpIfNumber(minVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if(curLanguage==2){newSLDForLegend+='<sld:Rule><sld:Title>Valor Bajo: '+cleanUpIfNumber(minVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if (fillOn){newSLDForLegend+='<Fill><CssParameter name="fill">#'+lowColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';}
						if (linesOn){newSLDForLegend+='<sld:Stroke/>';}
						newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
						
						if(curLanguage==1){newSLDForLegend+='<sld:Rule><sld:Title>Middle Value: '+cleanUpIfNumber(avgVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if(curLanguage==2){newSLDForLegend+='<sld:Rule><sld:Title>Valor Medio: '+cleanUpIfNumber(avgVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if (fillOn){newSLDForLegend+='<Fill><CssParameter name="fill">'+mixLowAndHighColors(.5)+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';}
						if (linesOn){newSLDForLegend+='<sld:Stroke/>';}
						newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
						
						if(curLanguage==1){newSLDForLegend+='<sld:Rule><sld:Title>High Value: '+cleanUpIfNumber(maxVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if(curLanguage==2){newSLDForLegend+='<sld:Rule><sld:Title>Valor Alto: '+cleanUpIfNumber(maxVal*displayFactor)+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.unit+'</sld:Title><PolygonSymbolizer>';};
						if (fillOn){newSLDForLegend+='<Fill><CssParameter name="fill">#'+highColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';}
						if (linesOn){newSLDForLegend+='<sld:Stroke/>';}
						newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
						
						//Close off the main part of the SLD document:
						newSLD+='</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						if (linesOn){newSLD+='<sld:Stroke/>';}
						newSLD+='</PolygonSymbolizer></sld:Rule>';	
				
				};

				//Take care of null values
				if(Ext.getCmp("chkNull").checked){
					newSLD+='<sld:Rule><sld:Title>Conservation ROI Layer (null values)</sld:Title><ogc:Filter><ogc:PropertyIsNull><ogc:PropertyName>'+theAttribute+'</ogc:PropertyName></ogc:PropertyIsNull></ogc:Filter><PolygonSymbolizer>';
					if(curLanguage==1){newSLDForLegend+='<sld:Rule><sld:Title>Null Values </sld:Title><PolygonSymbolizer>';};
					if(curLanguage==2){newSLDForLegend+='<sld:Rule><sld:Title>Valores Nulos </sld:Title><PolygonSymbolizer>';};
					if (fillOn){
						newSLD+='<Fill><CssParameter name="fill">#'+defaultColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						newSLDForLegend+='<Fill><CssParameter name="fill">#'+defaultColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
					}
					if (linesOn){
						newSLD+='<sld:Stroke/>';
						newSLDForLegend+='<sld:Stroke/>';
					}
					newSLD+='</PolygonSymbolizer></sld:Rule>';
					newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
				}
				
				//Insert default color if no color scheme applied
				if ((!colorSchemeOn)|(!fillOn)){
					newSLD+='<sld:Rule><sld:Title>Conservation ROI Layer</sld:Title><PolygonSymbolizer>';
					if(curLanguage==1){newSLDForLegend+='<sld:Rule><sld:Title>Data Layer</sld:Title><PolygonSymbolizer>';};
					if(curLanguage==2){newSLDForLegend+='<sld:Rule><sld:Title>Capa de Datos</sld:Title><PolygonSymbolizer>';};
					if (fillOn){
						newSLD+='<Fill><CssParameter name="fill">#'+defaultColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						newSLDForLegend+='<Fill><CssParameter name="fill">#'+defaultColor+'</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill>';
						}
					if (linesOn){
						newSLD+='<sld:Stroke/>';
						newSLDForLegend+='<sld:Stroke/>';
					}
					newSLD+='</PolygonSymbolizer></sld:Rule>';
					newSLDForLegend+='</PolygonSymbolizer></sld:Rule>';
				}
							
			//SLD document closing
			newSLD+='</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
			
			updateDataLayerParams();
			dataLayer.mergeNewParams({sld_body: newSLD});	
			
			//Do the Legends

				//Legend Entry for Data Layer
				
					var dataLayerStr = Ext.getCmp("datasource").getRawValue()+" Layer";
					if (curLanguage==2){dataLayerStr = "Capa de "+Ext.getCmp("datasource").getRawValue()};
					
					if ((!colorSchemeOn)||(!fillOn)){colorSchemeLegendLayer.setName(dataLayerStr)};
					if ((colorSchemeOn) && (curLanguage==1)){colorSchemeLegendLayer.setName(Ext.getCmp("datasource").getRawValue()+" Layer Colored By: "+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.displayName)};
					if ((colorSchemeOn) && (curLanguage==2)){colorSchemeLegendLayer.setName(Ext.getCmp("datasource").getRawValue()+" Capa Matizada por: "+Ext.getCmp('colorAttribute').getSelectionModel().selections.items[0].data.displayName)};
					
					newSLDForLegend+='</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
					//updateDataLayerParams();
					colorSchemeLegendLayer.mergeNewParams({sld_body: newSLDForLegend});
					colorSchemeLegendLayer.setVisibility(true);
			
				//Legend Entry for Matt Hansen Basemap
				
					hansenLegendLayer.setVisibility(ghan.getVisibility());
					if (ghan.getVisibility()==true){
						if (curLanguage==1){hansenLegendLayer.setName("Basemap: Forest Change 2000-2012");hansenLegendLayer.mergeNewParams({styles: 'hansenLegend'});};
						if (curLanguage==2){hansenLegendLayer.setName("Basemap: Cambio Forestal 2000-2012");hansenLegendLayer.mergeNewParams({styles: 'hansenLegend_span'});};  //Note accents in hanseneLegend_span don't come through on localhost (geoserver deoesn't respect decalred encoding), but it's fine on AcuGIS
						
						hansenLegendLayer.setVisibility(true);
					}
		
	}
	
	//app.mapPanel.body.dom.style.cursor = 'pointer';
	//imgWait.style.visibility = 'hidden';

}

function medianResponse(e, theAttribute) {

}

function checkMedian(theAttribute) {					
	if(userLayerActive){
		var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getMaxAvgMinWhere_userdata";
		var firstParams = "theAttribute:"+theAttribute+";layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName;
	}
	else{
		var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getMaxAvgMinWhere";
		var firstParams = "theAttribute:"+theAttribute+";dataSource:"+dataSourceName
	}
					
	updateDataLayerParams();					
	var params = preParams+"&viewparams="+firstParams+';'+theViewParams;
	
	//app.mapPanel.body.dom.style.cursor = 'wait';
	//imgWait.style.visibility = 'visible';
	var response = new XMLHttpRequest();
		//response.addEventListener("readystatechange", medianResponse, false);
		response.onreadystatechange=function() {
			if(response.readyState == 4 && response.status == 200) {
				if (byTagNS(response.responseXML,"median",workspaceName)){
					medianVal = Number(byTagNS(response.responseXML,"median",workspaceName));
					if(medianVal==0){
						if(curLanguage==1){alert("Error: within your study area, the median value of benefit variable "+ theAttribute +" is zero. This means that prioritization cannot proceed (see Instructions for more details). Please change your region of interest, update your data, or choose 'mean' as the method of normalizing benefits. However, using the mean to normalize benefits requires caution due to the mean's sensitivity to outliers.");};
						if(curLanguage==2){alert("Error: dentro de su área de estudio , el valore de mediana para la variable de "+theAttribute+" es cero . Esto significa que el establecimiento de prioridades no puede proceder (consulte Instrucciones para más detalles). Por favor, cambiar su región de interés , actualizar sus datos , o elegir 'promedio' como el método de los beneficios de la normalización . Sin embargo, utilizando la media para normalizar beneficios requiere precaución debido a la sensibilidad de la media de los valores atípicos.");};
						prioritizationOn = false;
					}
				}
				else{						
					if(curLanguage==1){alert("Warning: median value for the benefit variable " +theAttribute+" could not be determined. All values may be null.");};
					if(curLanguage==2){alert("Advertencia: el valore de mediana para la variable de " +theAttribute+" no se pudo determinar . Todos los valores pueden ser nulo.");};
				}
				//app.mapPanel.body.dom.style.cursor = 'pointer';
				//imgWait.style.visibility = 'hidden';
			}
		}
		//medianResponse;
		
		response.open( "POST","../../geoserver/"+workspaceName+"/ows",true);
		response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		response.send(params);
	
	//else {
		//Try sending again without final viewParams if not successful
	//		var params = preParams+"&viewparams="+firstParams;
	//		response.open( "POST","../../geoserver/"+workspaceName+"/ows", false);
	//		response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//		response.send(params);
	//		if (byTagNS(response.responseXML,"median",workspaceName)){
	//			medianVal = Number(byTagNS(response.responseXML,"median",workspaceName));
	//			return medianVal;
	//		}
	//}
			
}

function updatePrioritization() {
	
	var prioritizationOn = prioritizationLayer.getVisibility();
	if(prioritizationOn==true & (dataSourceNum==4 | dataSourceNum==6 | dataSourceNum==7) & manualSelectOn == false){
		if(curLanguage==1){Ext.Msg.alert("Warning", "To work with this layer you must first select a smaller region using the DEFINE STUDY AREA panel.");};
		if(curLanguage==2){Ext.Msg.alert("Aviso", "Para trabajar con esta capa, primero debe seleccionar una región más pequeña utilizando el panel DEFINIR ÁREA DE ESTUDIO.");};			
		prioritizationOn=false;
		app.mapPanel.body.dom.style.cursor = 'pointer';
		imgWait.style.visibility = 'hidden';
	}
	
	if(prioritizationOn){
					
		prioritizationLayer.setVisibility(false);
			
		var prioritizationLayerName = "data_prioritize";
		if(userLayerActive){prioritizationLayerName += "_userdata"};
		
		priorityParams="dataSource:"+dataSourceName
		if(userLayerActive){priorityParams+=';layerPIN:'+phpVarlayerPIN+';userName:'+phpVarUserName;}
		if((userLayerActive) || dataSourceNum == 1 || dataSourceNum==2) {priorityParams+=';predAcessCode:519';}
		priorityParams+=';geomZero:519';
		
		priorityParams+=";locationParam:"+locationParamName+";budgetMax:"
			if (Ext.getCmp('rawRadio').getValue()){
				priorityParams += Ext.getCmp('budget_raw').value
			}
			else {
				priorityParams += (Ext.getCmp('budget_percentage').value/100) + "*(SELECT MAX(cumcost) FROM BenefitBudget)"
			};
			
		priorityParams+=";"+whereClauseStr+";"+inClauseStr+";forestThreshold:"+forestThreshold;
		
		if(Ext.getCmp("chkRisk").getValue())
		{
			priorityParams+=";riskVar:risk";
		}
		else {
			priorityParams+=";riskVar:1";
		};
		
		
		if(Ext.getCmp("chkCost").getValue())
		{
			priorityParams+=";costVar:cost";
		}
		else {
			priorityParams+=";costVar:1";
		};
		
		if(Ext.getCmp("chkArea").getValue())
		{
			priorityParams+=";areaWeight:forarea*shape_area_ha";
		}
		else {
			priorityParams+=";areaWeight:1";
		};
		
		if(Ext.getCmp("chkMean").getValue())
		{
			priorityParams+=";medianOrMean:avg";
		}
		else {
			priorityParams+=";medianOrMean:median";
		};
		
		if((dataSourceNum==3)|(dataSourceNum==4)|(dataSourceNum==5))
		{
			priorityParams+=";carbonVar:"+Ext.getCmp('carbonBenefitChoose').store.data.items[Ext.getCmp('carbonBenefitChoose').selectedIndex].data.field1+";bioVar:"+Ext.getCmp('bioBenefitChoose').store.data.items[Ext.getCmp('bioBenefitChoose').selectedIndex].data.field1;
		};
		

		if(Ext.getCmp('benefitTabPanel').getActiveTab().id=='compareTab'){
			//prioritizationLayer.mergeNewParams({sld_body: null});
			if (Ext.getCmp('compareObjectiveCombo').selectedIndex==-1){Ext.getCmp('compareObjectiveCombo').selectedIndex=0}; //selectedIndex defaults to -1, so if user has not clicked the combo box at all we need to manually change selectedIndex to 0
			if (Ext.getCmp('compareObjectiveCombo').selectedIndex==0){
				//Update 11/14/2015, switching back to predefined styles, because accents don't work sending through in sld_body
				//Previously had switched back to sld_body after it was working: 11/06/2015----> Note: using predefined styles from Geoserver because sending sld_body for some reason wouldn't work with the CBH style (others worked fine).  Note, to get this to work, had to define the styles not in any work space, then get the layer WMS from geoserver/wms and not geoserver/forestro_ws/wms
				
			if(curLanguage==1){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CBH"});};
			if(curLanguage==2){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CBH_span"});};
				
				//if(curLanguage==1){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CBH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Carbon Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversity Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Hydrological Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbon and Biodiversity</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbon and Hydrological</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FFFF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversity and Hydrological</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF00FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>All Three Benefits</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFFFF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer><sld:PolygonSymbolizer><sld:Fill><GraphicFill><Graphic><Mark><WellKnownName>shape://times</WellKnownName><Stroke><CssParameter name="stroke">#000000</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></Mark><Size>16</Size></Graphic></GraphicFill></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
				//if(curLanguage==2){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CBH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Sólo Carbono</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Sólo Biodiversidad</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Sólo Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbono y Biodiversidad</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbono y Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FFFF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversidad y Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF00FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Todos Tres Beneficios</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFFFF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer><sld:PolygonSymbolizer><sld:Fill><GraphicFill><Graphic><Mark><WellKnownName>shape://times</WellKnownName><Stroke><CssParameter name="stroke">#000000</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></Mark><Size>16</Size></Graphic></GraphicFill></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
			};
			if (Ext.getCmp('compareObjectiveCombo').selectedIndex==1){
				if(curLanguage==1){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CB"});};
				if(curLanguage==2){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CB_span"});};
			
				//prioritizationLayer.mergeNewParams({styles: "data_prioritize_CB"});
				//if(curLanguage==1){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CB</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Carbon Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversity Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbon and Biodiversity</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
				//if(curLanguage==2){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CB</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Sólo Carbono</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Sólo Biodiversidad</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbono y Biodiversidad</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
			};
			if (Ext.getCmp('compareObjectiveCombo').selectedIndex==2){
				if(curLanguage==1){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CH"});};
				if(curLanguage==2){prioritizationLayer.mergeNewParams({styles: "data_prioritize_CH_span"});};
			
				
				//prioritizationLayer.mergeNewParams({styles: "data_prioritize_CH"});
				//if(curLanguage==1){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Carbon Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Hydrological Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbon and Hydrological</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
				//if(curLanguage==2){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_CH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Sólo Carbono</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#00FF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Sólo Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Carbono y Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedc</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
			};
			if (Ext.getCmp('compareObjectiveCombo').selectedIndex==3){
				if(curLanguage==1){prioritizationLayer.mergeNewParams({styles: "data_prioritize_BH"});};
				if(curLanguage==2){prioritizationLayer.mergeNewParams({styles: "data_prioritize_BH_span"});};
				
				//prioritizationLayer.mergeNewParams({styles: "data_prioritize_BH"});
				//if(curLanguage==1){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_BH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Biodiversity Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Hydroligical Only</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversity and Hydrological</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
				//if(curLanguage==2){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':'+prioritizationLayerName+'</sld:Name><sld:UserStyle><sld:Name>mredd_prioritize_BH</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Sólo Biodiversidad</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Sólo Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsNotEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#0000FF</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Title>Biodiversidad y Hidrológico</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedb</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>selectedh</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#FFFF00</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
			};
		}
		else{
			if(Ext.getCmp('benefitTabPanel').getActiveTab().id=='combineTab'){
				priorityParams+= ";weight1:" + Ext.getCmp('weight1').value;
				priorityParams+= ";weight2:" + Ext.getCmp('weight2').value;
				priorityParams+= ";weight3:" + Ext.getCmp('weight3').value;
			};
			//prioritizationLayer.mergeNewParams({styles: "data_prioritize_Default"});
			var userLayerSuffix = "";
			if(userLayerActive){userLayerSuffix = "_userdata"};
			
			if(curLanguage==1){prioritizationLayer.mergeNewParams({styles: "data_prioritize_Default"});};
			if(curLanguage==2){prioritizationLayer.mergeNewParams({styles: "data_prioritize_Default_span"});};
			
			//Display null values as a warning <----This would be if we used dynamic styles
			//if(curLanguage==1){nullSLD='<sld:Rule><sld:Title>Omitted (null benefit value)</sld:Title><ogc:Filter><ogc:PropertyIsNull><ogc:PropertyName>compositeecb</ogc:PropertyName></ogc:PropertyIsNull></ogc:Filter><PolygonSymbolizer><Fill><CssParameter name="fill">#808080</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill></PolygonSymbolizer></sld:Rule>';};
			//if(curLanguage==2){nullSLD='<sld:Rule><sld:Title>Omitido (beneficio nulo)</sld:Title><ogc:Filter><ogc:PropertyIsNull><ogc:PropertyName>compositeecb</ogc:PropertyName></ogc:PropertyIsNull></ogc:Filter><PolygonSymbolizer><Fill><CssParameter name="fill">#808080</CssParameter><CssParameter name="fill-opacity">1</CssParameter></Fill></PolygonSymbolizer></sld:Rule>';};
		
			//if(curLanguage==1){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':data_prioritize'+userLayerSuffix+'</sld:Name><sld:UserStyle><sld:Name>'+workspaceName+':data_prioritize_Default'+userLayerSuffix+'</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Selected</sld:Title><ogc:Filter><ogc:And><ogc:Not><ogc:PropertyIsNull><ogc:PropertyName>selected</ogc:PropertyName></ogc:PropertyIsNull></ogc:Not><ogc:PropertyIsEqualTo><ogc:PropertyName>selected</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#'+selectedFillColor+'</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule>'+nullSLD+'</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
			//if(curLanguage==2){prioritizationLayer.mergeNewParams({sld_body: '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0"><sld:NamedLayer><sld:Name>'+workspaceName+':data_prioritize'+userLayerSuffix+'</sld:Name><sld:UserStyle><sld:Name>'+workspaceName+':data_prioritize_Default'+userLayerSuffix+'</sld:Name><sld:Title/><sld:FeatureTypeStyle><sld:Rule><sld:Title>Seleccionado</sld:Title><ogc:Filter><ogc:And><ogc:Not><ogc:PropertyIsNull><ogc:PropertyName>selected</ogc:PropertyName></ogc:PropertyIsNull></ogc:Not><ogc:PropertyIsEqualTo><ogc:PropertyName>selected</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#'+selectedFillColor+'</sld:CssParameter></sld:Fill><sld:Stroke/></sld:PolygonSymbolizer></sld:Rule>'+nullSLD+'</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>'});};
		};
		
		if(curLanguage==1){prioritizationLayer.setName("Targeting:");};
		if(curLanguage==2){prioritizationLayer.setName("Focalización:");};
		
		prioritizationLayer.mergeNewParams({layers:prioritizationLayerName, viewparams:priorityParams});
		
		//If prioritization layer hasn't been added yet, do so now (and put it "under" the selection layer).  Prioritization layer not loaded on startup because it would delay startup unncessarily
		if ((app.mapPanel.map.getLayersByName("Prioritization Layer").length==0)&&prioritizationOn==true){
			if(app.mapPanel.map.getLayersByName("Selection").length>0){app.mapPanel.map.removeLayer(selectLayer)};
			app.mapPanel.map.addLayer(prioritizationLayer);
			app.mapPanel.map.addLayer(selectLayer);
		};
	}
	
	prioritizationLayer.setVisibility(prioritizationOn);
	prioritizationLayer.redraw();
	dataLayer.redraw();
	
	//Taking this next line out for now while updateStyling is synchronous
	//updateStyling();
		
	//Check for zero median problems, if user is normalizing benefits by median (default)
	if(prioritizationOn & !Ext.getCmp("chkMean").getValue()){
		checkMedian("carbon");
		checkMedian("bio");
		checkMedian("hydro");
	}
}

function setDataSource(dataSourceNumToSetTo)
{
		
		//all layers now use fctt_id as idAttribute (so, I could deprecate it as a variable but leaving it as is for flexibility if I ever wanted to change how things work.
		idAttribute = "fctt_id";
		
		if (dataSourceNumToSetTo==1) {
			dataSourceName = "mredd";
			userLayerActive = false;
			locationParamName="sitio_id";
			nameAttribute = "nom_na";						
			locationData = [[0,'Study Area'],[1,'Jalisco'],[2,'Oaxaca'],[3,'Chiapas'],[4,'Michoacán/Mexico'],[5,'Yucután'],[6,'Chihuahua']];
			spanishLocationData = [[0,'Zona de AATRs'],[1,'Jalisco'],[2,'Oaxaca'],[3,'Chiapas'],[4,'Michoacán/Mexico'],[5,'Yucután'],[6,'Chihuahua']];
			linesOn = true;	
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("(pes.)")};
						
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariables;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanish;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").hide();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
		if (dataSourceNumToSetTo==2) {
			dataSourceName = "mex_pred";
			userLayerActive = false;
			locationParamName="region";
			nameAttribute = "nombpred";
			userLayerActive = false;			
			locationData = [[0,'Entire Country'],[1,'North West'],[2,'North'],[3,'North East'],[4,'Central West'],[5,'Central South'],[6,'South Pacific'],[7,'Gulf'],[8,'Peninsula']];
			spanishLocationData = [[0,'País Íntegro'],[1,'Noroeste'],[2,'Norte'],[3,'Nordeste'],[4,'Centro-Oeste'],[5,'Centro Sur'],[6,'Pacifico Sur'],[7,'Golfo'],[8,'Península']];
			linesOn = false;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("(pes.)")};
						
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariables;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanish;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").hide();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
		if (dataSourceNumToSetTo==3) {
			dataSourceName = "ca_10km";
			userLayerActive = false;
			locationParamName="sitio_id";
			nameAttribute = "";			
			locationData = [[0,'All Countries'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			spanishLocationData = [[0,'Todos Países'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			linesOn = false;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariablesCA;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishCA;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").show();	
			Ext.getCmp("subdatasetLabel").hide();			
		}
		
		if (dataSourceNumToSetTo==4) {
			dataSourceName = "ca_1km";
			userLayerActive = false;
			locationParamName="sitio_id";
			nameAttribute = "";
			locationData = [[0,'All Countries'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			spanishLocationData = [[0,'Todos Países'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			linesOn = false;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariablesCA;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishCA;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").show();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
		if (dataSourceNumToSetTo==5) {
			dataSourceName = "ca_adm";
			userLayerActive = false;
			locationParamName="sitio_id";
			nameAttribute = "";			
			locationData = [[0,'All Countries'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			spanishLocationData = [[0,'Todos Países'],[222,'El Salvador'],[591,'Panama'],[558,'Nicaragua'],[340,'Honduras'],[320,'Guatemala'],[214,'Dominican Republic'],[188,'Costa Rica'],[84,'Belize']];
			linesOn = true;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariablesCA;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishCA;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").show();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
		if (dataSourceNumToSetTo==6) {
			dataSourceName = "sa_10km";
			userLayerActive = false;
			locationParamName="sitio_id";
			nameAttribute = "";			
			locationData = [[0,'All Countries'],[1,'Argentina'],[2,'Bolivia'],[3,'Brazil'],[4,'Chile'],[5,'Colombia'],[6,'Ecuador'],[7,'Guyana'],[8,'Paraguay'],[9,'Peru'],[10,'Suriname'],[11,'Uruguay'],[12,'Venezuela']];
			spanishLocationData = [[0,'Todos Países'],[1,'Argentina'],[2,'Bolivia'],[3,'Brazil'],[4,'Chile'],[5,'Colombia'],[6,'Ecuador'],[7,'Guyana'],[8,'Paraguay'],[9,'Peru'],[10,'Suriname'],[11,'Uruguay'],[12,'Venezuela']];
			linesOn = false;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariablesSA;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishSA;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").hide();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
		if (dataSourceNumToSetTo==7) {
			dataSourceName = "sa_1km_r1";
			userLayerActive = false;
			locationParamName="1";
			nameAttribute = "";			
			//locationData = [[1,'Region 1'], [2, 'Region 2']];
			//spanishLocationData = [[1,'Region 1'],[2,'Region 2']];
			locationData = [[0,'All']];
			spanishLocationData = [[0,'Todos']];
			linesOn = false;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariablesSA;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishSA;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").hide();
			subDataNum=1;
			Ext.getCmp("subdatasetLabel").show();
		}
				
		if (dataSourceNumToSetTo>7) {
			dataSourceName = phpVarDataSetList[dataSourceNumToSetTo-numOnBoardDataSets];
			userDataSourceUOA = phpVarDataSetUOA[dataSourceNumToSetTo-numOnBoardDataSets];
			userLayerActive = true;
			locationParamName="1";
			nameAttribute = "";
			Ext.getCmp("adminSelect").hide();
			
			locationData = [[0,'All']];
			spanishLocationData = [[0,'Todos']];
			linesOn = true;
			if(typeof Ext.getCmp("currencyLabel") != "undefined"){Ext.getCmp("currencyLabel").setText("($)")};
			
			if(curLanguage==1){Ext.getCmp("colorAttribute").store = prioritizationVariables;}
			if(curLanguage==2){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanish;}
				Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp("chooseBenefits").hide();
			Ext.getCmp("subdatasetLabel").hide();
		}
		
	if(userLayerActive){
		dataSourceLayerName = workspaceName+":userlayer_query";
	
		//Disable Caja tool for userlayer
		if(selectMode==2){
			if (curLanguage==1) {Ext.Msg.alert("","Unfortunately, the Box/Manual Select Tool can not be used with user-defined layers at this time. Note that you can create an arbitrary region of interest for user-defined layers by restricting your shapefile to the fctt_id you are interested in before uploading the data in the User Console");};
			if (curLanguage==2) {Ext.Msg.alert("","Desafortunadamente, la Herramienta Caja/Selección Manual no se puede utilizar con capas definidas por el usuario en este momento. Tenga en cuenta que puede crear una región arbitraria de interés para las capas definidas por el usuario mediante la restricción de su archivo de formas a la fctt_id le interesa antes de cargar los datos en la consola de usuario.");};								
			Ext.getCmp("selectsubmitselection").disable();
		}
	}
	else if(dataSourceNumToSetTo==7){
		dataSourceLayerName = workspaceName+":sa_1km_query";
	}
	else{
		dataSourceLayerName = workspaceName+":"+dataSourceName+"_query";
	}
			
	if (curLanguage==1) {
		Ext.getCmp('regionSelectCombo').bindStore(locationData);
	};
	if (curLanguage==2) {
		Ext.getCmp('regionSelectCombo').bindStore(spanishLocationData);
	};
	
}

function updateLanguage() {
		
	//Detect if user is logged in, and if not, refresh the login/registration splashscreen with current language
	if (phpVarIsLoggedIn==0){
		Ext.getCmp("loginRegisterWindowBox").refreshMe("../../usersystem/splashscreen.php?lang="+curLanguage);
	}
	
	//Detect if user console is displayed, and if not, refresh it with current language
	if ((phpVarIsLoggedIn==1)&&(Ext.getCmp("returnToFCTTItem").hidden==false)){
		app.mapPanel.map.div.innerHTML = "<iframe src='../../usersystem/userconsole.php?lang="+curLanguage+"' width = 100% height = 100%></iframe>"
	}
	
	if (curLanguage==1){
	
		Ext.getCmp("appCopyright").setText("© 2014 Resources for the Future. All rights reserved. No portion of the data or model may be used without permission.");
		Ext.getCmp("howToItem").setText("How To");
		Ext.getCmp("instructionsItem").setText("Instructions");
		Ext.getCmp("descriptionItem").setText("Description");
		Ext.getCmp("faqItem").setText("FAQ");
		Ext.getCmp("videoTutorialItem").setText("Video Tutorial");
		Ext.getCmp("userQuestionsItem").setText("User Questions");
		Ext.getCmp("emailItem").setText("Email");
		Ext.getCmp("aboutItem").setText("About");
		Ext.getCmp("metadataItem").setText("Metadata");
		Ext.getCmp("sponsorsItem").setText("Sponsors");
		Ext.getCmp("teamItem").setText("Team");
		Ext.getCmp("emailItem2").setText("Email");
		Ext.getCmp("feedbackItem").setText("Feedback");
		Ext.getCmp("userQuestionsItem2").setText("User Questions");
		Ext.getCmp("userCommentsItem").setText("User Comments");
		Ext.getCmp("emailItem3").setText("Email");
		if (phpVarIsLoggedIn==1){
			Ext.getCmp('loginItem').setText("Logged in as "+phpVarUserName);
		}
		else{
			Ext.getCmp('loginItem').setText("Use your own data");
		}
		Ext.getCmp('userConsoleItem').setText("User Console");
		Ext.getCmp('returnToFCTTItem').setText("Reload FCTT");
		Ext.getCmp('logoutItem').setText("Logout");
	
		Ext.getCmp("toolPanel").setTitle("<center><div style='color: black; font-weight: bold; font-size: 12px'>Tool Box</div>");
		
		Ext.getCmp("regionPanel").setTitle("DEFINE STUDY AREA");
		Ext.getCmp("datasetLabel").label.update("Dataset:");
		Ext.getCmp("subdatasetLabel").label.update("Subdataset:");
		loadUserLayers([[6,'South America 10km'],[7,'South America 1km'],[5,'Central America Administrative'], [3,'Central America 10km'],[4,'Central America 1km'],[2,'Mexico Predios'],[1,'MREDD AATRs']]);
		Ext.getCmp("regionLabel").label.update("Region:");
			Ext.getCmp('regionSelectCombo').bindStore(locationData);
			Ext.getCmp('regionSelectCombo').setValue(Ext.getCmp('regionSelectCombo').store.data.items[Ext.getCmp('regionSelectCombo').selectedIndex].data.field2);					
		Ext.getCmp("thresholdLabel").label.update("Minimum forest cover:");
		Ext.getCmp("adminSelect").setTitle("By administrative boundary");
		Ext.getCmp("manuallySelect").setTitle("Using manual selection tool");
		Ext.getCmp("selectionMode").label.update("Selection mode:");
		updateSelectionButtonLanguage();
		Ext.getCmp("selectModeCombo").bindStore([[1,'Polygon'],[2,'Box']]);//,[3,'Upload shapefile']]);
		Ext.getCmp("selectModeCombo").setValue(Ext.getCmp('selectModeCombo').store.data.items[Ext.getCmp('selectModeCombo').selectedIndex].data.field2);
		
		Ext.getCmp("optionsPanel").setTitle("DISPLAY OPTIONS");
		Ext.getCmp('defaultColorPanel').setTitle('<center><div style="color: '+defaultColor+'; font-weight: bold">Default Shape Fill Color</div>');
		Ext.getCmp('shpLinesLabel').label.update('Shape lines');
		Ext.getCmp('shpFillLabel').label.update('Shape fill');
		Ext.getCmp('opacityLabel').label.update('Opacity');
		Ext.getCmp('margLayerLabel').label.update('Marginality Layer');
		Ext.getCmp('basemapLabel').label.update('Base map type');
		Ext.getCmp('basemapCombo').bindStore([[0,'None'],[1,'Google Physical'],[2,'Google Hybrid'],[3,'Google Satellite'],[4,'Microsoft Bing Street Map'],[5,'Forest Change(2000-2012)']]);
			Ext.getCmp("basemapCombo").setValue(Ext.getCmp('basemapCombo').store.data.items[Ext.getCmp('basemapCombo').selectedIndex].data.field2);
		Ext.getCmp('showScaleLabel').label.update('Show Scale');
		Ext.getCmp('panZoomLabel').label.update('Pan/Zoom Tool');
		Ext.getCmp('mouseWheelLabel').label.update('Mouse wheel zoom');
		
		Ext.getCmp('colorByAttributePanel').setTitle('TARGETING DATA');
		Ext.getCmp('lowColorPanel').setTitle('<center><div style="color: '+lowColor+'; font-weight: bold">Low color</div>');
		Ext.getCmp('highColorPanel').setTitle('<center><div style="color: '+highColor+'; font-weight: bold">High color</div>');
		Ext.getCmp('methodLabel').label.update('Method');
		Ext.getCmp('methodCombo').bindStore([[0,'Interpolate'],[1,'Quantiles']]);
			Ext.getCmp("methodCombo").setValue(Ext.getCmp('methodCombo').store.data.items[Ext.getCmp('methodCombo').selectedIndex].data.field2);
		Ext.getCmp('quantilesLabel').label.update('# Quantiles');
		
		var selectedIndex=Ext.getCmp('colorAttribute').getSelectionModel().getSelectedIndex();						
		Ext.getCmp("colorAttribute").store = prioritizationVariables;
		if((dataSourceNum==3)|(dataSourceNum==4)|(dataSourceNum==5)){Ext.getCmp("colorAttribute").store = prioritizationVariablesCA;}
		if((dataSourceNum==6)|(dataSourceNum==7)){Ext.getCmp("colorAttribute").store = prioritizationVariablesSA;}
			Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp('colorAttribute').getSelectionModel().selectRow(selectedIndex)
		
		Ext.getCmp('chkNullLabel').label.update('Show null values');
		Ext.getCmp('chkNull').wrap.child('.x-form-cb-label').update('(in default color)');
		
		Ext.getCmp('updatedatavis').setText("<div style='color:green; font-weight: bold;font-size: 12'>Update Data Visualization</div>");
		Ext.getCmp('cleardatavis').setText("<div style='color:black;font-size: 12'>Clear</div>");
		
		Ext.getCmp('selectPanel').setTitle('TARGET');
		Ext.getCmp('chooseBenefits').setTitle('Choose Benefit Variables');
		Ext.getCmp('carbonBenefitLabel').label.update('Carbon:');
		Ext.getCmp('bioBenefitLabel').label.update('Biodiversity:');		
		Ext.getCmp('carbonBenefitChoose').bindStore([['carbon','Non-soil carbon'],['carbon_total','Total carbon'],['carbon_soil','Carbon in soil']]);
			Ext.getCmp('carbonBenefitChoose').setValue(Ext.getCmp('carbonBenefitChoose').store.data.items[Ext.getCmp('carbonBenefitChoose').selectedIndex].data.field2);
		Ext.getCmp('bioBenefitChoose').bindStore([['bio','Global RWRI'],['bio_loc','National RWRI'],['bio_count','Threat. species count']]);
			Ext.getCmp('bioBenefitChoose').setValue(Ext.getCmp('bioBenefitChoose').store.data.items[Ext.getCmp('bioBenefitChoose').selectedIndex].data.field2);
		Ext.getCmp('priorityBudget').setTitle('Choose Budget');
		Ext.getCmp('percentageRadio').el.next('label').update('<span style="font-size: 12px;">' + 'Percentage of total:' + '</span>');
		Ext.getCmp('rawRadio').el.next('label').update('<span style="font-size: 12px;">' + 'Raw budget:' + '</span>');
		Ext.getCmp('combineTab').setTitle('Weight Benefits');
		Ext.getCmp('carbonweightfield').label.update('<div style="color: green; font-weight: bold">Carbon:</div>');
		Ext.getCmp('bioweightfield').label.update('<div style="color: red; font-weight: bold">Biodiversity:</div>');
		Ext.getCmp('hydroweightfield').label.update('<div style="color: blue; font-weight: bold">Hydrological:</div>');
		Ext.getCmp('compareTab').setTitle('Compare');
		Ext.getCmp('compareObjectiveCombo').bindStore([[0,'All Benefits'],[1,'Carbon and Biodiversity'],[2,'Carbon and Hydro'],[3,'Biodiversity and Hydro']]);
			Ext.getCmp("compareObjectiveCombo").setValue(Ext.getCmp('compareObjectiveCombo').store.data.items[Ext.getCmp('compareObjectiveCombo').selectedIndex].data.field2);
		Ext.getCmp('selectedFillColorPanel').setTitle('<center><div style="color: '+selectedFillColor+'; font-weight: bold">Selected Shape Fill Color</div>');
		Ext.getCmp('chkRiskLabel').label.update('Scale benefits by deforestation risk');
		Ext.getCmp('chkCostLabel').label.update('Divide expected benefits by cost');
		Ext.getCmp('chkAreaLabel').label.update('Scale total costs by forest area');
		Ext.getCmp('chkMeanLabel').label.update('Normalize benefits by mean instead of median');
		Ext.getCmp('priorityOpacityLabel').label.update('Opacity:');
		Ext.getCmp('submitprioritization').setText("<div style='color:green; font-weight: bold;font-size: 12'>Submit/Update</div>");
		Ext.getCmp('clearprioritization').setText("<div style='color:black;font-size: 12'>Clear</div>");
		
		Ext.getCmp('printButton').setText("<div style='color:black;font-size: 12'>Print/PDF</div>");
		Ext.getCmp('resetButton').setText("<div style='color:blue;font-weight: bold;font-size: 12'>Reset All</div>");
		Ext.getCmp('resetLegend').setText('Reset Legend Position');
		
		Ext.getCmp('exportPanel').setTitle('EXPORT');
		Ext.getCmp('shapefileButton').setText("<div style='color:black;font-size: 12'>Export Shapefile</div>");
		Ext.getCmp('csvButton').setText("<div style='color:black;font-size: 12'>Export CSV</div>"); 
		
		if(typeof instructionsWindowSp != "undefined"){if(!instructionsWindowSp.hidden){instructionsWindow.show();instructionsWindowSp.hide()}};
		Ext.getCmp("myLegend").setTitle("Legend");
		
		//marginalityLayer.mergeNewParams({styles:'marginality'});
		marginalityLayer.setName("Marginalization Index");
		
	}
	if (curLanguage==2){
		Ext.getCmp("appCopyright").setText("© 2014 Resources for the Future. Reservados todos los derechos. Ninguna porción de los datos o el modelo puede ser usado sin permiso.");
		Ext.getCmp("howToItem").setText("Cómo");
		Ext.getCmp("instructionsItem").setText("Instrucciones");
		Ext.getCmp("descriptionItem").setText("Descripción");
		Ext.getCmp("faqItem").setText("FAQ");
		Ext.getCmp("videoTutorialItem").setText("Video Tutorial");
		Ext.getCmp("userQuestionsItem").setText("Preguntas de Usuarios");
		Ext.getCmp("emailItem").setText("Correo");
		Ext.getCmp("aboutItem").setText("Acerca de");
		Ext.getCmp("metadataItem").setText("Metadatos");
		Ext.getCmp("sponsorsItem").setText("Promotores");
		Ext.getCmp("teamItem").setText("Equipo");
		Ext.getCmp("emailItem2").setText("Correo");
		Ext.getCmp("feedbackItem").setText("Feedback");
		Ext.getCmp("userQuestionsItem2").setText("Preguntas de Usuarios");
		Ext.getCmp("userCommentsItem").setText("Comentarios de Usuarios");
		Ext.getCmp("emailItem3").setText("Correo");
		if (phpVarIsLoggedIn==1){
			Ext.getCmp('loginItem').setText("Conectado como "+phpVarUserName);
		}
		else{
			Ext.getCmp('loginItem').setText("Utilice sus propios datos");
		}
		Ext.getCmp('userConsoleItem').setText("Consola de Usuario");
		Ext.getCmp('returnToFCTTItem').setText("Recargar FCTT");
		Ext.getCmp('logoutItem').setText("Cerrar Sesión");
		
		Ext.getCmp("toolPanel").setTitle("<center><div style='color: black; font-weight: bold; font-size: 12px'>Caja de Herramientas</div>");
			
		Ext.getCmp("regionPanel").setTitle("DEFINIR ÁREA DE ESTUDIO");
		Ext.getCmp("datasetLabel").label.update("Datos:");
		Ext.getCmp("subdatasetLabel").label.update("Subdatos:");

		loadUserLayers([[6,'Sudamerica 10km'],[7,'Sudamerica 1km'],[5,'Centroamérica Administrativa'],[3,'Centroamérica 10km'],[4,'Centroamérica 1km'],[2,'Predios de Mexico'],[1,'MREDD AATRs']]);
		Ext.getCmp("regionLabel").label.update("Región:");
			Ext.getCmp('regionSelectCombo').bindStore(spanishLocationData);
			Ext.getCmp('regionSelectCombo').setValue(Ext.getCmp('regionSelectCombo').store.data.items[Ext.getCmp('regionSelectCombo').selectedIndex].data.field2);						
		Ext.getCmp("thresholdLabel").label.update("Cubierta forestal mínima:");
		Ext.getCmp("adminSelect").setTitle("Por límites administrativos");
		Ext.getCmp("manuallySelect").setTitle("Seleccionar manualmente");
		Ext.getCmp("selectionMode").label.update("Modo de selección:");
		updateSelectionButtonLanguage();	
		Ext.getCmp("selectModeCombo").bindStore([[1,'Polígono'],[2,'Caja']]);//,[3,'Subir shapefile']]);
			Ext.getCmp("selectModeCombo").setValue(Ext.getCmp('selectModeCombo').store.data.items[Ext.getCmp('selectModeCombo').selectedIndex].data.field2);
		
		Ext.getCmp("optionsPanel").setTitle("OPCIONES DE VISUALIZACIÓN");
		Ext.getCmp('defaultColorPanel').setTitle('<center><div style="color: '+defaultColor+'; font-weight: bold">Color de Relleno Defecto</div>');
		Ext.getCmp('shpLinesLabel').label.update('Líneas poligonales');
		Ext.getCmp('shpFillLabel').label.update('Relleno de forma');
		Ext.getCmp('opacityLabel').label.update('Opacidad');
		Ext.getCmp('priorityOpacityLabel').label.update('Opacidad');
		Ext.getCmp('margLayerLabel').label.update('Capa de Marginalidad');
		Ext.getCmp('basemapLabel').label.update('Tipo de basemap');
		Ext.getCmp('basemapCombo').bindStore([[0,'Ninguno'],[1,'Google Físico'],[2,'Google Híbrido'],[3,'Google Satélite'],[4,'Microsoft Bing (calles)'],[5,'Cambio Forestal(2000-2012)']]);
			Ext.getCmp("basemapCombo").setValue(Ext.getCmp('basemapCombo').store.data.items[Ext.getCmp('basemapCombo').selectedIndex].data.field2);
		Ext.getCmp('showScaleLabel').label.update('Mostrar Escala');
		Ext.getCmp('panZoomLabel').label.update('Ampliar/Recorrer');
		Ext.getCmp('mouseWheelLabel').label.update('Zoom con rueda del mouse');

		Ext.getCmp('colorByAttributePanel').setTitle('DATOS DE FOCALIZACIÓN');
		Ext.getCmp('lowColorPanel').setTitle('<center><div style="color: '+lowColor+'; font-weight: bold">Color Bajo</div>');
		Ext.getCmp('highColorPanel').setTitle('<center><div style="color: '+highColor+'; font-weight: bold">Color Alto</div>');
		Ext.getCmp('methodLabel').label.update('Método');
		Ext.getCmp('methodCombo').bindStore([[0,'Interpolar'],[1,'Cuantilas']]);
			Ext.getCmp("methodCombo").setValue(Ext.getCmp('methodCombo').store.data.items[Ext.getCmp('methodCombo').selectedIndex].data.field2);
		Ext.getCmp('quantilesLabel').label.update('# Cuantilas');
		
		var selectedIndex=Ext.getCmp('colorAttribute').getSelectionModel().getSelectedIndex();						
		Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanish;
		if((dataSourceNum==3)|(dataSourceNum==4)|(dataSourceNum==5)){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishCA;}
		if((dataSourceNum==6)|(dataSourceNum==7)){Ext.getCmp("colorAttribute").store = prioritizationVariablesSpanishSA;}
			Ext.getCmp("colorAttribute").getView().refresh();
			Ext.getCmp('colorAttribute').getSelectionModel().selectRow(selectedIndex)
						
		Ext.getCmp('chkNullLabel').label.update('Mostrar val. nulos');
		Ext.getCmp('chkNull').wrap.child('.x-form-cb-label').update('(en color defecto)');
		
		Ext.getCmp('updatedatavis').setText("<div style='color:green; font-weight: bold;font-size: 12'>Actualizar Visualización</div>");
		Ext.getCmp('cleardatavis').setText("<div style='color:black;font-size: 12'>Borrar</div>");
		
		Ext.getCmp('selectPanel').setTitle('FOCALIZAR');		
		Ext.getCmp('chooseBenefits').setTitle('Elegir Variables de Beneficios');
		Ext.getCmp('carbonBenefitLabel').label.update('Carbono:');
		Ext.getCmp('bioBenefitLabel').label.update('Biodiversidad:');
		Ext.getCmp('carbonBenefitChoose').bindStore([['carbon','Carbono no suelo'],['carbon_total','Carbono total'],['carbon_soil','Carbono en el suelo']]);
			Ext.getCmp('carbonBenefitChoose').setValue(Ext.getCmp('carbonBenefitChoose').store.data.items[Ext.getCmp('carbonBenefitChoose').selectedIndex].data.field2);
		Ext.getCmp('bioBenefitChoose').bindStore([['bio','RWRI Global'],['bio_loc','RWRI Nacional'],['bio_count','Núm. esp. amenazadas']]);
			Ext.getCmp('bioBenefitChoose').setValue(Ext.getCmp('bioBenefitChoose').store.data.items[Ext.getCmp('bioBenefitChoose').selectedIndex].data.field2);		
		Ext.getCmp('priorityBudget').setTitle('Elegir Presupuesto');
		Ext.getCmp('percentageRadio').el.next('label').update('<span style="font-size: 12px;">' + 'Porcentaje del total:' + '</span>');
		Ext.getCmp('rawRadio').el.next('label').update('<span style="font-size: 12px;">' + 'Prima:' + '</span>');
		Ext.getCmp('combineTab').setTitle('Ponderar Beneficios');
		Ext.getCmp('carbonweightfield').label.update('<div style="color: green; font-weight: bold">Carbono:</div>');
		Ext.getCmp('bioweightfield').label.update('<div style="color: red; font-weight: bold">Biodiversidad:</div>');
		Ext.getCmp('hydroweightfield').label.update('<div style="color: blue; font-weight: bold">Hidrológico:</div>');
		Ext.getCmp('compareTab').setTitle('Comparar');
		Ext.getCmp('compareObjectiveCombo').bindStore([[0,'Todos Beneficios'],[1,'Carbono y Biodiversidad'],[2,'Carbon y Hidrológico'],[3,'Biodiversidad y Hidrológico']]);
			Ext.getCmp("compareObjectiveCombo").setValue(Ext.getCmp('compareObjectiveCombo').store.data.items[Ext.getCmp('compareObjectiveCombo').selectedIndex].data.field2);
		Ext.getCmp('selectedFillColorPanel').setTitle('<center><div style="color: '+selectedFillColor+'; font-weight: bold">Color de Relleno Seleccionado</div>');
		Ext.getCmp('chkRiskLabel').label.update('Escalar lost beneficios por riesgo');
		Ext.getCmp('chkCostLabel').label.update('Divida a los beneficios esperados por el costo');
		Ext.getCmp('chkAreaLabel').label.update('Escalar los costos totales del área de bosque');
		Ext.getCmp('chkMeanLabel').label.update('Normalizar beneficios por la media en lugar de la mediana');
		Ext.getCmp('priorityOpacityLabel').label.update('Opacidad:');
		Ext.getCmp('submitprioritization').setText("<div style='color:green; font-weight: bold;font-size: 12'>Entregar/Actualizar</div>");
		Ext.getCmp('clearprioritization').setText("<div style='color:black;font-size: 12'>Borrar</div>");
		
		Ext.getCmp('printButton').setText("<div style='color:black;font-size: 12'>Imprimir/PDF</div>");
		Ext.getCmp('resetButton').setText("<div style='color:blue;font-weight: bold;font-size: 12'>Restablecer Todo</div>");
		Ext.getCmp('resetLegend').setText('Restablecer Leyenda');
	
		Ext.getCmp('exportPanel').setTitle('EXPORTAR');
		Ext.getCmp('shapefileButton').setText("<div style='color:black;font-size: 12'>Exportar Shapefile</div>");
		Ext.getCmp('csvButton').setText("<div style='color:black;font-size: 12'>Exportar CSV</div>"); 
		
		if(typeof instructionsWindow != "undefined"){if(!instructionsWindow.hidden){instructionsWindow.hide();instructionsWindowSp.show()}};
		Ext.getCmp("myLegend").setTitle("Leyenda");
		
		//marginalityLayer.mergeNewParams({styles:'marginality_span'});
		marginalityLayer.setName("Índice de Marginación");
	}

resetLegendPosition(); //This will update appTitle
updateStyling();
updatePrioritization();
updateOnZoom(app.mapPanel.map.getZoom()); 
}

function updateSelectionButtonLanguage() {
	if (curLanguage==1){
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Finalizar</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Submit to Server</div>");
		};
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Nueva Selección</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Select New</div>");
		};
		if (Ext.getCmp('cancelclearselection').text=="<div style='color:black;font-size: 12'>Borrar/Cancelar</div>"){
			Ext.getCmp('cancelclearselection').setText("<div style='color:black;font-size: 12'>Clear/Cancel</div>");
		};
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Empezar a Seleccionar</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Begin Selecting</div>");
		};
	};
	if (curLanguage==2){
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Submit to Server</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Finalizar</div>");
		};
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Select New</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Nueva Selección</div>");
		};
		if (Ext.getCmp('cancelclearselection').text=="<div style='color:black;font-size: 12'>Clear/Cancel</div>"){
			Ext.getCmp('cancelclearselection').setText("<div style='color:black;font-size: 12'>Borrar/Cancelar</div>");
		};
		if (Ext.getCmp('selectsubmitselection').text=="<div style='color:green; font-weight: bold;font-size: 12'>Begin Selecting</div>"){
			Ext.getCmp('selectsubmitselection').setText("<div style='color:green; font-weight: bold;font-size: 12'>Empezar a Seleccionar</div>");
		};
	};
}
			
//Color functions to convert between Hex and RBG representations
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function mixLowAndHighColors(val) {
	var r = Math.floor(val*hexToRgb(highColor).r+(1-val)*hexToRgb(lowColor).r),
	g = Math.floor(val*hexToRgb(highColor).g+(1-val)*hexToRgb(lowColor).g),
	b = Math.floor(val*hexToRgb(highColor).b+(1-val)*hexToRgb(lowColor).b);
	return rgbToHex(r,g,b);
}	

function openPage(theUrl, theTitle) {
	new Ext.Window({
		title : theTitle,
		width: window.innerWidth * 0.8,
		height: window.innerHeight * 0.9,
		layout : 'fit',
		items : [{
			xtype : "box",
			autoEl : {
				tag : "iframe",
				src : theUrl
			}
		}]
	}).show();
}

function zoomToRegion(){		
	var boundsToZoomTo = new OpenLayers.Bounds();	
	
	//First get extents from SQL query to layer forestro_ws:getExtents
	
	if(userLayerActive){
		var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getExtents_userdata";
		var firstParams = "layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName;
	}
	else{
		var preParams = "service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getExtents";
		var firstParams = "dataSource:"+dataSourceName;
	}
					
	updateDataLayerParams();					
	var params = preParams+"&viewparams="+firstParams+';'+theViewParams;
	
	var response = new XMLHttpRequest();
		response.open( "POST","../../geoserver/"+workspaceName+"/ows",false);
		response.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	response.send(params);
	if (byTagNS(response.responseXML,"xmin",workspaceName)){
		boundsToZoomTo.left = Number(byTagNS(response.responseXML,"xmin",workspaceName));
		boundsToZoomTo.right = Number(byTagNS(response.responseXML,"xmax",workspaceName));
		boundsToZoomTo.top = Number(byTagNS(response.responseXML,"ymin",workspaceName));
		boundsToZoomTo.bottom = Number(byTagNS(response.responseXML,"ymax",workspaceName));
	}
	else {
		boundsToZoomTo.left = -92.2223587033315;
		boundsToZoomTo.right = -68.3226394649928;
		boundsToZoomTo.top = 5.49902677495186;
		boundsToZoomTo.bottom = 19.9323616027744;
	}		

	if(dataSourceNum == 6){
		boundsToZoomTo = boundsToZoomTo.scale(0.6);
	}
	else{
		boundsToZoomTo = boundsToZoomTo.scale(1.2);
	}
	app.mapPanel.map.zoomToExtent(boundsToZoomTo.transform("EPSG:4326","EPSG:900913"), false);
}

function resetLegendPosition(){
	myLegend.show();	
	var temp = app.mapPanel.el.getTop()+5
	myLegend.alignTo(Ext.getBody(), 'tr-tr', [-10,temp]);

	//Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-675)
	
	if (curLanguage==1){
		if(window.innerWidth<1200)
		{
			Ext.getCmp("appTitle").setText("Forest Conservation Targeting Tool (Beta)");
			Ext.getCmp("appTitle").setWidth(window.innerWidth-700);
			Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-700);
		}
		else{
			Ext.getCmp("appTitle").setText("Forest Conservation Targeting Tool (Beta)");
			Ext.getCmp("appTitle").setWidth(window.innerWidth-700);
			Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-700);
		}
	}
	
	if (curLanguage==2){
		if(window.innerWidth<1200)
		{
			Ext.getCmp("appTitle").setText("Herramienta Focalización de Conservación Forestal (Beta)");
			Ext.getCmp("appTitle").setWidth(window.innerWidth-700);
			Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-700);
		}
		else{
			Ext.getCmp("appTitle").setText("Herramienta Focalización de Conservación Forestal (Beta)");
			Ext.getCmp("appTitle").setWidth(window.innerWidth-700);
			Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-700);
		}
	}
		
	//style: "font: bold "+topBarHeight/1.75+"px arial; color: white; text-align: center; display:inline-block"
	//if (curLanguage==1&&window.innerWidth<1500){Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-550)};
	//if (curLanguage==2&&window.innerWidth<1500){Ext.getCmp("appTitleContainer").setWidth(window.innerWidth-575)};
}


function updateOnZoom(zLevel){

	if(inUserConsole==0)
	{

		if( zLevel < 8 && dataSourceNum==4)
		{
			if (curLanguage==1){imgZoomEng.style.visibility = 'visible';imgZoomSpan.style.visibility = 'hidden'};
			if (curLanguage==2){imgZoomEng.style.visibility = 'hidden';imgZoomSpan.style.visibility = 'visible'};
			dataLayer.setVisibility(false);
			imgWait.style.visibility = 'hidden';
		};
		if( zLevel < 8 && dataSourceNum==7)
		{
			if (curLanguage==1){imgZoomEng.style.visibility = 'visible';imgZoomSpan.style.visibility = 'hidden'};
			if (curLanguage==2){imgZoomEng.style.visibility = 'hidden';imgZoomSpan.style.visibility = 'visible'};
			dataLayer.setVisibility(false);
			imgWait.style.visibility = 'hidden';
		};
		if( zLevel >= 8 || (dataSourceNum!=4 && dataSourceNum!=7))
		{
			if (curLanguage==1){imgZoomEng.style.visibility = 'hidden';imgZoomSpan.style.visibility = 'hidden'};
			if (curLanguage==2){imgZoomEng.style.visibility = 'hidden';imgZoomSpan.style.visibility = 'hidden'};
			dataLayer.setVisibility(true);	
		};		
		
		if(zLevel > 13 && ghan.getVisibility()==true){
			ghan.setVisibility(false);
			ghanActive = true;
		};
		if(zLevel <= 13 && ghanActive==true){
			ghan.setVisibility(true);
		};

		if(zLevel > 18 && gosm.getVisibility()==true){
			gosm.setVisibility(false);
			gosmActive = true;
		};
		if(zLevel <= 18 && gosmActive==true){
			gosm.setVisibility(true);
		};

	}
}

function updateDataLayerParams(){
	theViewParams = inClauseStr+';'+whereClauseStr+';forestThreshold:'+forestThreshold
	if(userLayerActive){theViewParams+=';layerPIN:'+phpVarlayerPIN+';userName:'+phpVarUserName+';dataSource:'+dataSourceName;}
	if((userLayerActive) || dataSourceNum == 1 || dataSourceNum==2) {theViewParams+=';predAcessCode:519';}
	if(dataSourceNum==7){theViewParams+=';regionNum:'+subDataNum;}
	dataLayer.mergeNewParams({layers:dataSourceLayerName,viewparams:theViewParams});
}

function loadUserLayers(theLayerList){
	
	//If user is logged in, load additional user layers into dataset list now that we've updated the on-board dataset names
	if (phpVarIsLoggedIn==1){

			//Add a divider to separate the user layers from the on board data layers
			if (phpVarNumDataSets>0){theLayerList.push([-1,'----------------------']);}
			
			for (var i = 1; i <= phpVarNumDataSets; i++) {
				var dataSourceID = i+numOnBoardDataSets;
				theLayerList.push([dataSourceID.toString(),phpVarDataSetList[i]]);
			}
	}

	//Bind new layer list store to datasource combobox
	Ext.getCmp("datasource").bindStore(theLayerList);
	//Ext.getCmp("datasource").setValue(Ext.getCmp('datasource').store.data.items[Ext.getCmp('datasource').selectedIndex].data.field2);
	Ext.getCmp("datasource").setValue(dataSourceNum);
}

function featuresFromXY(xy){
	var lonlat = app.mapPanel.map.getLonLatFromPixel(xy);
	lonlat.transform("EPSG:900913","EPSG:4326");
	
	var config = {"method":"GET", "async":false};
	
	//http://localhost:8080/geoserver/forestro_users_ws/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=forestro_users_ws:getFeatureInfo&viewparams=dataSource:ca_adm;latCoord:13;lonCoord:-87;layerPIN:df48ff95e4;userName:len
	if(userLayerActive){
		config.url = "../../geoserver/"+workspaceName+"/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getFeatureInfo_userdata&viewparams=layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName+";predAcessCode:519";
	}
	else if(dataSourceNum == 3 || dataSourceNum==4 || dataSourceNum==5){
		config.url = "../../geoserver/"+workspaceName+"/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getFeatureInfo_ca&viewparams=dataSource:"+dataSourceName.replace("ca_","");
	}
	else if(dataSourceNum == 6 || dataSourceNum==7){
		config.url = "../../geoserver/"+workspaceName+"/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getFeatureInfo_sa&viewparams=dataSource:"+dataSourceName;
	}
	else{
		config.url = "../../geoserver/"+workspaceName+"/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+workspaceName+":getFeatureInfo_mex&viewparams=layerPIN:"+phpVarlayerPIN+";userName:"+phpVarUserName+";dataSource:"+dataSourceName+";predAcessCode:519";
	}	
	config.url += ";latCoord:"+lonlat.lat+";lonCoord:"+lonlat.lon;
					
	var xmlhttp = OpenLayers.Request.issue(config);		

	var gmlReader = new OpenLayers.Format.GML({ extractAttributes: true });
	var features = gmlReader.read(xmlhttp.responseText);
	
	return features;

}

//Need a cross browser version of the getElementsByTagName function, because Chrome searches just by tag name, whereas Firefox searches by namespace:tag
function byTagNS(xml,tag,ns) {
	gottenElement = xml.getElementsByTagName(ns+":"+tag)[0];
	if(!gottenElement || gottenElement == null || gottenElement.length==0){
		gottenElement = xml.getElementsByTagName(tag)[0];
	}
	if(!gottenElement || gottenElement == null || gottenElement.length==0){
		return false;
	}
	else {
		return gottenElement.textContent;
	}
}

//Return number with only three digits after decimal, or in scientific notation if the first three digits after decimal are zero
function cleanUpIfNumber(data) {
	if(isNaN(data)){
		return String(data);
	}
	else {
		if(Number(data)>999999) {
			return String(Number(data).toExponential(3));
		}
		else if(Number(data).toFixed(3)==0) {
			return String(Number(data).toExponential(3));
		}
		else if(Number.isInteger(Number(data))) {
			return String(Number(data));
		}
		else{
			return String(Number(data).toFixed(3));
		}
	}
}