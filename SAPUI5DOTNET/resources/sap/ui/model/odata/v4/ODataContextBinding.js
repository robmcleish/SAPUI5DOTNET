/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/model/Binding","sap/ui/model/ChangeReason","sap/ui/model/ContextBinding","./_ODataHelper","./Context","./lib/_Cache","./lib/_Helper","./lib/_SyncPromise"],function(q,B,C,a,_,b,c,d,e){"use strict";var s="sap.ui.model.odata.v4.ODataContextBinding",S={change:true,dataReceived:true,dataRequested:true};var O=a.extend("sap.ui.model.odata.v4.ODataContextBinding",{constructor:function(m,p,o,P){var f,i=p.indexOf("(...)"),D=i>=0;a.call(this,m,p);if(p.slice(-1)==="/"){throw new Error("Invalid path: "+p);}this.oCache=undefined;this.mCacheByContext=undefined;this.aDependentBindings=undefined;this.sGroupId=undefined;this.oOperation=undefined;this.mQueryOptions=undefined;this.sRefreshGroupId=undefined;this.sUpdateGroupId=undefined;if(!this.bRelative||D||P){this.mQueryOptions=_.buildQueryOptions(m.mUriParameters,P,_.aAllowedSystemQueryOptions);f=_.buildBindingParameters(P,["$$groupId","$$updateGroupId"]);this.sGroupId=f.$$groupId;this.sUpdateGroupId=f.$$updateGroupId;if(D){this.oOperation={bAction:undefined,oMetadataPromise:undefined,mParameters:{}};if(i!==p.length-5){throw new Error("The path must not continue after a deferred operation: "+p);}}else if(!this.bRelative){this.oCache=c.createSingle(m.oRequestor,p.slice(1),this.mQueryOptions);}}this.oElementContext=this.bRelative?null:b.create(this.oModel,this,p);this.setContext(o);},metadata:{publicMethods:[]}});O.prototype._requestOperationMetadata=function(){var m=this.oModel.getMetaModel(),o,p;if(!this.oOperation.oMetadataPromise){p=this.sPath.lastIndexOf("/");o=this.sPath.slice(p+1,-5);this.oOperation.oMetadataPromise=m.requestObject("/"+o).then(function(M){if(!M){throw new Error("Unknown operation: "+o);}if(Array.isArray(M)&&M[0].$kind==="Action"){return M;}if(Array.isArray(M)&&M[0].$kind==="Function"){throw new Error("Functions without import not supported: "+o);}if(M.$kind==="ActionImport"){return m.requestObject("/"+M.$Action);}if(M.$kind==="FunctionImport"){return m.requestObject("/"+M.$Function);}throw new Error("Not an operation: "+o);}).then(function(f){if(f.length!==1){throw new Error("Unsupported operation overloading: "+o);}return f[0];});}return this.oOperation.oMetadataPromise;};O.prototype.attachEvent=function(E){if(!(E in S)){throw new Error("Unsupported event '"+E+"': v4.ODataContextBinding#attachEvent");}return a.prototype.attachEvent.apply(this,arguments);};O.prototype.destroy=function(){if(this.bRelative&&this.oContext){this.oContext.deregisterBinding(this);}a.prototype.destroy.apply(this);};O.prototype.execute=function(g){var t=this;function f(o,p){var E,i,h,P,j=(p+t.sPath).slice(1),k;g=g||t.getGroupId();t.oOperation.bAction=o.$kind==="Action";if(t.oOperation.bAction){if(!t.oCache){t.oCache=c.createSingle(t.oModel.oRequestor,j.slice(0,-5),t.mQueryOptions,false,true);}if(t.bRelative){i=t.sPath.lastIndexOf("/");E=t.oContext.getObject(i>=0?t.sPath.slice(0,i):"")["@odata.etag"];}k=t.oCache.post(g,t.oOperation.mParameters,E);}else{h=o.$Parameter;P=[];if(h){h.forEach(function(l){var n=l.$Name;if(n in t.oOperation.mParameters){if(l.$IsCollection){throw new Error("Unsupported: collection parameter");}P.push(encodeURIComponent(n)+"="+encodeURIComponent(d.formatLiteral(t.oOperation.mParameters[n],l.$Type)));}});}t.oCache=c.createSingle(t.oModel.oRequestor,j.replace("...",P.join(',')),t.mQueryOptions);k=t.oCache.read(g);}t.oModel.addedRequestToGroup(g);return k;}_.checkGroupId(g);if(!this.oOperation){throw new Error("The binding must be deferred: "+this.sPath);}if(this.bRelative){if(!this.oContext){throw new Error("Unresolved binding: "+this.sPath);}if(this.oContext.getPath().indexOf("(...)")>=0){throw new Error("Nested deferred operation bindings not supported: "+this.oModel.resolve(this.sPath,this.oContext));}}return this._requestOperationMetadata().then(function(o){if(t.bRelative){return t.getContext().requestCanonicalPath().then(function(p){return f(o,p+"/");});}return f(o,"");}).then(function(r){t._fireChange({reason:C.Change});})["catch"](function(E){t.oModel.reportError("Failed to execute "+t.sPath,s,E);throw E;});};O.prototype.deregisterChange=function(p,l){if(this.oCache){this.oCache.deregisterChange(p,l);}else if(this.oContext){this.oContext.deregisterChange(d.buildPath(this.sPath,p),l);}};O.prototype.getGroupId=function(){return this.sGroupId||this.oModel.getGroupId();};O.prototype.getUpdateGroupId=function(){return this.sUpdateGroupId||this.oModel.getUpdateGroupId();};O.prototype.hasPendingChanges=function(){return _.hasPendingChanges(this,true);};O.prototype.initialize=function(){if(this.oElementContext){this._fireChange({reason:C.Change});}};O.prototype.isInitial=function(){throw new Error("Unsupported operation: v4.ODataContextBinding#isInitial");};O.prototype.refresh=function(g){if(this.bRelative){throw new Error("Refresh on this binding is not supported");}if(this.hasPendingChanges()){throw new Error("Cannot refresh due to pending changes");}_.checkGroupId(g);this.refreshInternal(g);};O.prototype.refreshInternal=function(g){if(this.oCache){if(!this.oOperation||!this.oOperation.bAction){this.sRefreshGroupId=g;if(this.bRelative){this.oCache.deregisterChange();this.oCache=_.createContextCacheProxy(this,this.oContext);this.mCacheByContext=undefined;}else{this.oCache.refresh();}this._fireChange({reason:C.Refresh});}}if(this.aDependentBindings){this.aDependentBindings.forEach(function(D){D.refreshInternal(g);});}};O.prototype.fetchAbsoluteValue=function(p){var r;if(this.oCache){r=this.oModel.resolve(this.sPath,this.oContext);if(p===r||p.lastIndexOf(r+"/")===0){return this.fetchValue(p.slice(r.length+1));}}if(this.oContext){return this.oContext.fetchAbsoluteValue(p);}return e.resolve();};O.prototype.fetchValue=function(p,l){var D=false,g,t=this;if(this.oCache){g=this.sRefreshGroupId||this.getGroupId();this.sRefreshGroupId=undefined;return this.oCache.read(g,p,function(){D=true;t.oModel.addedRequestToGroup(g,t.fireDataRequested.bind(t));},l).then(function(v){if(D){t.fireDataReceived();}return v;},function(E){if(D){if(E.canceled){t.fireDataReceived();}else{t.oModel.reportError("Failed to read path "+t.sPath,s,E);t.fireDataReceived({error:E});}}throw E;});}if(this.oContext){return this.oContext.fetchValue(d.buildPath(this.sPath,p),l);}return e.resolve();};O.prototype.resetChanges=function(){_.resetChanges(this,true);};O.prototype.resume=function(){throw new Error("Unsupported operation: v4.ODataContextBinding#resume");};O.prototype.setContext=function(o){if(this.oContext!==o){if(this.bRelative){if(this.oContext){this.oContext.deregisterBinding(this);}if(this.oCache){this.oCache.deregisterChange();this.oCache=undefined;}}if(this.bRelative&&(this.oElementContext||o)){if(o){o.registerBinding(this);this.oElementContext=b.create(this.oModel,this,this.oModel.resolve(this.sPath,o));if(!this.oOperation&&this.mQueryOptions){this.oCache=_.createContextCacheProxy(this,o);}}else{this.oElementContext=null;}B.prototype.setContext.call(this,o);}else{this.oContext=o;}}};O.prototype.setParameter=function(p,v){if(!this.oOperation){throw new Error("The binding must be deferred: "+this.sPath);}if(v===undefined){throw new Error("Missing value for parameter: "+p);}this.oOperation.mParameters[p]=v;return this;};O.prototype.suspend=function(){throw new Error("Unsupported operation: v4.ODataContextBinding#suspend");};O.prototype.toString=function(){return s+": "+(this.bRelative?this.oContext+"|":"")+this.sPath;};O.prototype.updateValue=function(g,p,v,E,P){var o;if(this.oCache){g=g||this.getUpdateGroupId();o=this.oCache.update(g,p,v,E,P);this.oModel.addedRequestToGroup(g);return o;}return this.oContext.updateValue(g,p,v,E,d.buildPath(this.sPath,P));};return O;},true);