(function(t){function e(e){for(var r,o,s=e[0],l=e[1],c=e[2],p=0,d=[];p<s.length;p++)o=s[p],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&d.push(a[o][0]),a[o]=0;for(r in l)Object.prototype.hasOwnProperty.call(l,r)&&(t[r]=l[r]);u&&u(e);while(d.length)d.shift()();return i.push.apply(i,c||[]),n()}function n(){for(var t,e=0;e<i.length;e++){for(var n=i[e],r=!0,s=1;s<n.length;s++){var l=n[s];0!==a[l]&&(r=!1)}r&&(i.splice(e--,1),t=o(o.s=n[0]))}return t}var r={},a={app:0},i=[];function o(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=t,o.c=r,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},o.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)o.d(n,r,function(e){return t[e]}.bind(null,r));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="/vlinder/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],l=s.push.bind(s);s.push=e,s=s.slice();for(var c=0;c<s.length;c++)e(s[c]);var u=l;i.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("cd49")},bf8c:function(t,e,n){t.exports=n.p+"img/vlinder01.f06b08c2.png"},cd49:function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app",[n("v-app-bar",{attrs:{app:"",color:"primary",dark:"",dense:""}},[n("v-toolbar-title",[t._v("VLINDER")]),n("v-spacer"),n("v-btn",{attrs:{href:"http://vlinder.ugent.be",target:"_blank",text:""}},[n("span",{staticClass:"mr-2"},[t._v("VLINDER website")]),n("v-icon",[t._v("mdi-open-in-new")])],1)],1),n("v-content",[n("v-container",[n("v-row",[n("v-col",{attrs:{sm:"12",md:"10","offset-md":"1"}},[n("StationsMap")],1)],1),n("v-row",t._l(t.stations,(function(e){return n("v-col",{key:e.id,attrs:{sm:"3"}},[n("StationCard",{attrs:{station:e,measurements:t.measurementsMap.get(e.id)||{}}})],1)})),1)],1)],1)],1)},i=[],o=(n("d81d"),n("4ec9"),n("d3b7"),n("3ca3"),n("ddb0"),n("d4ec")),s=n("bee2"),l=n("262e"),c=n("2caf"),u=n("9ab4"),p=n("60a3"),d=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"text-center"},[n("v-toolbar",{attrs:{flat:""}},[n("v-toolbar-title",[t._v(t._s(t.weatherProperties[t.weatherProperty].title))]),n("v-spacer"),n("v-btn-toggle",{attrs:{mandatory:""},model:{value:t.weatherProperty,callback:function(e){t.weatherProperty=e},expression:"weatherProperty"}},t._l(t.weatherProperties,(function(e){return n("v-tooltip",{key:e.property,attrs:{bottom:""},scopedSlots:t._u([{key:"activator",fn:function(r){var a=r.on;return[n("v-btn",t._g({attrs:{value:e.property}},a),[n("v-icon",[t._v(t._s(e.icon))])],1)]}}],null,!0)},[n("span",[t._v(t._s(e.name))])])})),1)],1),n("div",{attrs:{id:t.mapId}})],1)},h=[],m={temp:{property:"temp",name:"Temperatuur",legend:"Temperatuur (°C)",icon:"mdi-thermometer",title:"Temperatuur op dit moment",unit:"°C"},rainVolume:{property:"rainVolume",name:"Neerslag",legend:"Neerslag vandaag (l/m²)",icon:"mdi-weather-rainy",title:"Neerslag sinds middernacht",unit:"l/m²"},windSpeed:{property:"windSpeed",name:"Windsnelheid",legend:"Windsnelheid (km/u)",icon:"mdi-weather-windy",title:"Windsnelheid op dit moment",unit:"km/u"}},f=(n("99af"),n("4de4"),n("a15b"),n("b0c0"),n("96cf"),n("1da1")),v=n("5698"),g=n("d217");n("ac1f"),n("25f0"),n("5319");function b(){var t,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.color,r=e.title,a=e.tickSize,i=void 0===a?6:a,o=e.width,s=void 0===o?320:o,l=e.height,c=void 0===l?44+i:l,u=e.marginTop,p=void 0===u?18:u,d=e.marginRight,h=void 0===d?0:d,m=e.marginBottom,f=void 0===m?16+i:m,g=e.marginLeft,b=void 0===g?0:g,w=e.ticks,j=void 0===w?s/64:w,k=e.tickFormat,O=e.tickValues,x=v["b"]("svg").attr("width",s).attr("height",c).attr("viewBox",[0,0,s,c]).style("overflow","visible").style("display","block"),_=function(t){return t.selectAll(".tick line").attr("y1",p+f-c)};if(n.interpolate){var P=Math.min(n.domain().length,n.range().length);t=n.copy().rangeRound(v["l"](v["h"](b,s-h),P)),x.append("image").attr("x",b).attr("y",p).attr("width",s-b-h).attr("height",c-p-f).attr("preserveAspectRatio","none").attr("xlink:href",y(n.copy().domain(v["l"](v["h"](0,1),P))).toDataURL())}else if(n.interpolator){if(t=Object.assign(n.copy().interpolator(v["i"](b,s-h)),{range:function(){return[b,s-h]}}),x.append("image").attr("x",b).attr("y",p).attr("width",s-b-h).attr("height",c-p-f).attr("preserveAspectRatio","none").attr("xlink:href",y(n.interpolator()).toDataURL()),!t.ticks){if(void 0===O){var V=Math.round(j+1);O=v["m"](V).map((function(t){return v["k"](n.domain(),t/(V-1))}))}"function"!==typeof k&&(k=v["e"](void 0===k?",f":k))}}else if(n.invertExtent){var M=n.thresholds?n.thresholds():n.quantiles?n.quantiles():n.domain(),S=void 0===k?function(t){return t}:"string"===typeof k?v["e"](k):k;t=v["o"]().domain([-1,n.range().length-1]).rangeRound([b,s-h]),x.append("g").selectAll("rect").data(n.range()).join("rect").attr("x",(function(e,n){return t(n-1)})).attr("y",p).attr("width",(function(e,n){return t(n)-t(n-1)})).attr("height",c-p-f).attr("fill",(function(t){return t})),O=v["m"](M.length),k=function(t){return S(M[t],t)}}else t=v["n"]().domain(n.domain()).rangeRound([b,s-h]),x.append("g").selectAll("rect").data(n.domain()).join("rect").attr("x",t).attr("y",p).attr("width",Math.max(0,t.bandwidth()-1)).attr("height",c-p-f).attr("fill",n),_=function(){};return x.append("g").attr("transform","translate(0,".concat(c-f,")")).call(v["a"](t).ticks(j,"string"===typeof k?k:void 0).tickFormat("function"===typeof k?k:void 0).tickSize(i).tickValues(O)).call(_).call((function(t){return t.select(".domain").remove()})).call((function(t){return t.append("text").attr("x",b).attr("y",p+f-c-6).attr("fill","currentColor").attr("text-anchor","start").attr("font-weight","bold").text(r)})),x.node()}function y(t){for(var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:256,n=v["b"]("canvas").attr("width",e).attr("height",1).node(),r=n.getContext("2d"),a=0;a<e;++a)r.fillStyle=t(a/(e-1)),r.fillRect(a,0,1,1);return n}var w=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"temp";Object(o["a"])(this,t),this.selectedProperty="temp",this.measurementsMap=new Map,this.margin={top:5,right:10,bottom:50,left:10},this.width=900,this.height=420,this.selector=e,this.setProperty(n)}return Object(s["a"])(t,[{key:"fetchData",value:function(){var t=Object(f["a"])(regeneratorRuntime.mark((function t(){var e,n,r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e=fetch("https://raw.githubusercontent.com/bmesuere/belgium-topojson/master/belgium.json").then((function(t){return t.json()})),n=fetch("https://mooncake.ugent.be/api/stations").then((function(t){return t.json()})),r=fetch("https://mooncake.ugent.be/api/measurements").then((function(t){return t.json()})),t.next=5,e;case 5:return this.belgium=t.sent,t.next=8,n;case 8:return this.stations=t.sent,t.next=11,r;case 11:this.measurements=t.sent,this.measurementsMap=new Map(this.measurements.map((function(t){return[t.id,t]}))),this.belgium.objects.municipalities.geometries=this.belgium.objects.municipalities.geometries.filter((function(t){return"03000"!==t.properties.reg_nis}));case 14:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"init",value:function(){var t=Object(f["a"])(regeneratorRuntime.mark((function t(){var e,n,r,a,i=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,this.fetchData();case 2:this.colorScale=v["p"](v["j"]).domain(v["d"](this.measurements,(function(t){return t[i.selectedProperty]}))),e=v["f"]().fitExtent([[this.margin.left,this.margin.top],[this.width-this.margin.right,this.height-this.margin.bottom]],g["a"](this.belgium,this.belgium.objects.municipalities)),n=v["g"]().projection(e),r=v["q"](this.selector).append("svg").attr("viewBox","0, 0, ".concat(this.width,", ").concat(this.height)),a=v["q"]("body").append("div").attr("class","tooltip").style("position","absolute").style("visibility","visible").style("background-color","white").style("padding","6px").style("border","1px solid #dddddd").style("border-radius","3px").style("pointer-events","none").style("font","12px Roboto"),r.append("g").selectAll(".muni").data(g["a"](this.belgium,this.belgium.objects.municipalities).features).join("path").attr("class","muni").attr("fill","#eeeeee").attr("stroke","white").attr("stroke-linejoin","round").attr("d",n).append("title").text((function(t){var e;return null===t||void 0===t||null===(e=t.properties)||void 0===e?void 0:e.name_nl})),this.stationDots=r.append("g").selectAll(".station").data(this.stations).join("circle").attr("class","station").attr("id",(function(t){return"station-"+t.id})).attr("r",(function(t){var e;return"Ok"===(null===(e=i.measurementsMap.get(t.id))||void 0===e?void 0:e.status)?4:2})).attr("fill-opacity",(function(t){var e;return"Ok"===(null===(e=i.measurementsMap.get(t.id))||void 0===e?void 0:e.status)?.7:1})).attr("fill",(function(t){var e=i.measurementsMap.get(t.id);return"Ok"===(null===e||void 0===e?void 0:e.status)?i.colorScale(e[i.selectedProperty]):"black"})).attr("cx",(function(t){return e([t.coordinates.longitude,t.coordinates.latitude])[0]})).attr("cy",(function(t){return e([t.coordinates.longitude,t.coordinates.latitude])[1]})).on("mouseenter",(function(t){v["q"]("#station-"+t.id).attr("fill-opacity",1).attr("r",5),i.tooltip(a,t,v["c"].pageX,v["c"].pageY)})).on("mouseleave",(function(t){v["q"]("#station-"+t.id).attr("r",(function(t){var e;return"Ok"===(null===(e=i.measurementsMap.get(t.id))||void 0===e?void 0:e.status)?4:2})).attr("fill-opacity",(function(t){var e;return"Ok"===(null===(e=i.measurementsMap.get(t.id))||void 0===e?void 0:e.status)?.7:1})),i.tooltip(a,null)})),this.legend=r.append("g").attr("transform","translate(".concat(this.margin.left,", ").concat(this.height-this.margin.top-40,")")),this.legend.append((function(){return b({color:i.colorScale,title:m[i.selectedProperty].legend,width:200,tickSize:-10,ticks:4})}));case 11:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"tooltip",value:function(t,e,n,r){var a=this;if(!e)return t.style("visibility","hidden");t.style("visibility","visible").style("top",r+5+"px").style("left",n+15+"px").html("");var i="<b>".concat(e.given_name,"</b> - ").concat(e.city);i+=["temp","rainVolume","windSpeed"].map((function(t){return"<br>".concat(m[t].name,": <b>").concat(a.measurementsMap.get(e.id)[t]," ").concat(m[t].unit,"</b>")})).join(""),t.html(i)}},{key:"setProperty",value:function(t){this.selectedProperty=m.hasOwnProperty(t)?t:"temp"}},{key:"updateProperty",value:function(t){this.setProperty(t),this.update()}},{key:"update",value:function(){var t=this;this.legend.html(""),this.colorScale.domain(v["d"](this.measurements,(function(e){return e[t.selectedProperty]}))),this.legend.append((function(){return b({color:t.colorScale,title:m[t.selectedProperty].legend,width:200,tickSize:-10,ticks:4})})),this.stationDots.transition().attr("r",(function(e){var n;return"Ok"===(null===(n=t.measurementsMap.get(e.id))||void 0===n?void 0:n.status)?4:1})).attr("fill-opacity",(function(e){var n;return"Ok"===(null===(n=t.measurementsMap.get(e.id))||void 0===n?void 0:n.status)?.7:1})).attr("fill",(function(e){var n=t.measurementsMap.get(e.id);return"Ok"===(null===n||void 0===n?void 0:n.status)?t.colorScale(n[t.selectedProperty]):"black"}))}}]),t}(),j=function(t){Object(l["a"])(n,t);var e=Object(c["a"])(n);function n(){var t;return Object(o["a"])(this,n),t=e.apply(this,arguments),t.weatherProperties=m,t.weatherProperty="temp",t}return Object(s["a"])(n,[{key:"mounted",value:function(){this.map=new w("#".concat(this.mapId),this.weatherProperty),this.map.init()}},{key:"weatherPropertyChanged",value:function(t,e){this.map&&this.map.updateProperty(this.weatherProperty)}}]),n}(p["c"]);Object(u["a"])([Object(p["b"])({default:"stationsMap"})],j.prototype,"mapId",void 0),Object(u["a"])([Object(p["d"])("weatherProperty")],j.prototype,"weatherPropertyChanged",null),j=Object(u["a"])([p["a"]],j);var k=j,O=k,x=n("2877"),_=n("6544"),P=n.n(_),V=n("8336"),M=n("a609"),S=n("132d"),C=n("2fa4"),R=n("71d9"),T=n("2a7f"),I=n("3a2f"),L=Object(x["a"])(O,d,h,!1,null,null,null),A=L.exports;P()(L,{VBtn:V["a"],VBtnToggle:M["a"],VIcon:S["a"],VSpacer:C["a"],VToolbar:R["a"],VToolbarTitle:T["a"],VTooltip:I["a"]});var D=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-card",[r("v-img",{attrs:{src:n("bf8c")}}),r("v-list-item",{attrs:{"three-line":""}},[r("v-list-item-content",[r("div",{staticClass:"overline mb-2"},[t._v(t._s(t.station.name))]),r("v-list-item-title",{staticClass:"mb-1"},[t._v(t._s(t.station.given_name))]),r("v-list-item-subtitle",[t._v(t._s(t.station.city))])],1)],1),r("v-list",{attrs:{dense:"",subheader:""}},t._l(t.weatherProperties,(function(e){return r("v-list-item",{key:e.property},[r("v-list-item-subtitle",[r("v-icon",{staticClass:"pr-1"},[t._v(t._s(e.icon))]),t._v(" "+t._s(e.name))],1),r("v-list-item-title",{staticClass:"text-right"},[t._v(t._s(t.measurements[e.property])+" "+t._s(e.unit))])],1)})),1)],1)},B=[],E=function(t){Object(l["a"])(n,t);var e=Object(c["a"])(n);function n(){var t;return Object(o["a"])(this,n),t=e.apply(this,arguments),t.weatherProperties=m,t}return Object(s["a"])(n,[{key:"mounted",value:function(){}}]),n}(p["c"]);Object(u["a"])([Object(p["b"])()],E.prototype,"station",void 0),Object(u["a"])([Object(p["b"])()],E.prototype,"measurements",void 0),E=Object(u["a"])([p["a"]],E);var q=E,N=q,z=n("b0af"),$=n("adda3"),W=n("8860"),F=n("da13"),J=n("5d23"),U=Object(x["a"])(N,D,B,!1,null,null,null),X=U.exports;P()(U,{VCard:z["a"],VIcon:S["a"],VImg:$["a"],VList:W["a"],VListItem:F["a"],VListItemContent:J["a"],VListItemSubtitle:J["b"],VListItemTitle:J["c"]});var Y=function(t){Object(l["a"])(n,t);var e=Object(c["a"])(n);function n(){var t;return Object(o["a"])(this,n),t=e.apply(this,arguments),t.stations=[],t.measurementsMap=new Map,t}return Object(s["a"])(n,[{key:"mounted",value:function(){var t=this;fetch("https://mooncake.ugent.be/api/stations").then((function(t){return t.json()})).then((function(e){t.stations.push(e[0],e[1])})),fetch("https://mooncake.ugent.be/api/measurements").then((function(t){return t.json()})).then((function(e){t.measurementsMap=new Map(e.map((function(t){return[t.id,t]})))}))}}]),n}(p["c"]);Y=Object(u["a"])([Object(p["a"])({components:{StationsMap:A,StationCard:X}})],Y);var G=Y,H=G,K=n("7496"),Q=n("40dc"),Z=n("62ad"),tt=n("a523"),et=n("a75b"),nt=n("0fd9"),rt=Object(x["a"])(H,a,i,!1,null,null,null),at=rt.exports;P()(rt,{VApp:K["a"],VAppBar:Q["a"],VBtn:V["a"],VCol:Z["a"],VContainer:tt["a"],VContent:et["a"],VIcon:S["a"],VRow:nt["a"],VSpacer:C["a"],VToolbarTitle:T["a"]});var it=n("f309");r["a"].use(it["a"]);var ot=new it["a"]({});r["a"].config.productionTip=!1,new r["a"]({vuetify:ot,render:function(t){return t(at)}}).$mount("#app")}});
//# sourceMappingURL=app.cacafbce.js.map