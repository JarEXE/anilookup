"use strict";(self.webpackChunkanilookup=self.webpackChunkanilookup||[]).push([[233],{3233:function(t,e,a){a.r(e);var i=a(4165),s=a(5861),n=a(9439),r=a(2791),o=a(7689),c=a(2159),l=a(184);e.default=function(t){var e,a=r.useState(!1),d=(0,n.Z)(a,2),u=d[0],p=d[1],m=r.useState(!1),x=(0,n.Z)(m,2),g=x[0],h=x[1],b={marginBottom:"10px",marginTop:"10px",padding:"10px 5px",boxShadow:t.isDarkMode?"0px 0px 10px 5px rgba(60, 60, 60)":"0px 0px 10px 5px rgba(0, 0, 0, 0.2)",borderRadius:"10px",minWidth:"215px",background:t.isDarkMode?"#181818":"#fff"},f=(0,o.s0)(),v=function(){var a=(0,s.Z)((0,i.Z)().mark((function a(){return(0,i.Z)().wrap((function(a){for(;;)switch(a.prev=a.next){case 0:return p(!0),h(!0),a.next=4,fetch("https://kitsu.io/api/edge/anime?filter[text]=".concat(t.title,"&page[limit]=5")).then(function(){var t=(0,s.Z)((0,i.Z)().mark((function t(a){return(0,i.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,a.json();case 2:e=t.sent;case 3:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 4:e.data.map((function(a){return a.attributes.canonicalTitle===t.title||a.attributes.abbreviatedTitles.includes(t.title)||a.attributes.titles.en===t.title||a.attributes.titles.en_jp===t.title||a.attributes.titles.ja_jp===t.title?null!=a.attributes.coverImage?(sessionStorage.setItem("kitsuCover","".concat(a.attributes.coverImage.original)),sessionStorage.setItem("itemId","/anime/".concat(t.malid)),p(!1),h(!1)):(sessionStorage.setItem("kitsuCover",""),sessionStorage.setItem("itemId","/anime/".concat(t.malid)),p(!1),h(!1)):null!=e.data[0].attributes.coverImage&&(sessionStorage.setItem("kitsuCover","".concat(e.data[0].attributes.coverImage.original)),sessionStorage.setItem("itemId","/anime/".concat(t.malid)),p(!1),h(!1)),f("/details")}));case 5:case"end":return a.stop()}}),a)})));return function(){return a.apply(this,arguments)}}();return(0,l.jsx)(l.Fragment,{children:u?(0,l.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0, 0, 0, 0.75)",zIndex:"999"},children:(0,l.jsx)(c.Z,{active:g,spinner:(0,l.jsx)("span",{className:"overlay_loader"})})}):(0,l.jsx)("div",{className:"col-md-3",style:{margin:"10px",height:"800px"},children:(0,l.jsxs)("div",{style:b,className:"well text-center zoomed-landing-page",children:[(0,l.jsxs)("div",{className:"boxContainer",children:[(0,l.jsx)("img",{src:t.img,alt:"anime cover",loading:"lazy",style:{marginBottom:"20px",height:"300px",width:"200px",borderRadius:"10px"}}),(0,l.jsxs)("div",{className:"summary-container",children:[(0,l.jsx)("h5",{children:t.title}),(0,l.jsx)("div",{className:"".concat(t.isDarkMode?"synopsisDark":"synopsis"),children:(0,l.jsx)("p",{children:t.synopsis})})]})]}),(0,l.jsx)("button",{onClick:v,className:"btn btn-".concat(t.isDarkMode?"info":"dark"),children:"More details"})]})})})}}}]);
//# sourceMappingURL=233.64467d76.chunk.js.map