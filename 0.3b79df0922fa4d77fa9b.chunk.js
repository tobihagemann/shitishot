webpackJsonp([0],{"nS+4":function(n,l,e){"use strict";Object.defineProperty(l,"__esModule",{value:!0});var u=e("LMZF"),t=e("r8jB"),a=function(){},r=e("tM+F"),o=e("OylW"),i=e("KU+/"),c=e("c0x3"),s=e("HNiT"),_=e("vEzF"),p=e("6yhf"),f=e("UHIZ"),g=e("Un6q"),m=e("fxWY"),d=e("Qyse"),h=function(){function n(n){this.localeService=n,this.locales=[{text:"Deutsch",languageCode:"de",countryCode:"DE"},{text:"English",languageCode:"en",countryCode:"US"}]}return n.prototype.ngOnInit=function(){var n=this;this.currentLocale=this.locales.find(function(l){return l.languageCode==n.localeService.getCurrentLanguage()})},n.prototype.selectLocale=function(n){this.currentLocale=n,this.localeService.setDefaultLocale(n.languageCode,n.countryCode)},n}(),v=u._2({encapsulation:2,styles:[],data:{}});function b(n){return u._24(0,[(n()(),u._4(0,0,null,null,1,"a",[["class","dropdown-item"]],null,[[null,"click"]],function(n,l,e){var u=!0;return"click"===l&&(u=!1!==n.component.selectLocale(n.context.$implicit)&&u),u},null,null)),(n()(),u._23(1,null,["",""]))],null,function(n,l){n(l,1,0,l.context.$implicit.text)})}function w(n){return u._24(0,[(n()(),u._4(0,0,null,null,28,"nav",[["class","navbar navbar-light bg-light justify-content-between"]],null,null,null,null,null)),(n()(),u._23(-1,null,["\n  "])),(n()(),u._4(2,0,null,null,25,"div",[["class","container"]],null,null,null,null,null)),(n()(),u._23(-1,null,["\n    "])),(n()(),u._4(4,0,null,null,3,"a",[["class","navbar-brand"],["l10nTranslate",""],["routerLink","/"]],[[1,"target",0],[8,"href",4]],[[null,"click"]],function(n,l,e){var t=!0;return"click"===l&&(t=!1!==u._16(n,5).onClick(e.button,e.ctrlKey,e.metaKey,e.shiftKey)&&t),t},null,null)),u._3(5,671744,null,0,f.l,[f.k,f.a,g.g],{routerLink:[0,"routerLink"]},null),u._3(6,4866048,null,0,t.n,[t.r,u.k,u.C],{l10nTranslate:[0,"l10nTranslate"]},null),(n()(),u._23(-1,null,["Title"])),(n()(),u._23(-1,null,["\n    "])),(n()(),u._4(9,0,null,null,17,"div",[["class","nav-item dropdown"],["ngbDropdown",""],["placement","bottom-right"]],[[2,"show",null]],[[null,"keyup.esc"],["document","click"]],function(n,l,e){var t=!0;return"keyup.esc"===l&&(t=!1!==u._16(n,10).closeFromOutsideEsc()&&t),"document:click"===l&&(t=!1!==u._16(n,10).closeFromClick(e)&&t),t},null,null)),u._3(10,212992,null,2,m.a,[d.a,u.x],{placement:[0,"placement"]},null),u._21(335544320,1,{_menu:0}),u._21(335544320,2,{_toggle:0}),(n()(),u._23(-1,null,["\n      "])),(n()(),u._4(14,0,null,null,4,"a",[["aria-expanded","false"],["aria-haspopup","true"],["class","nav-link dropdown-toggle dropdown-toggle"],["id","languageDropdown"],["ngbDropdownToggle",""]],[[1,"aria-expanded",0]],[[null,"click"]],function(n,l,e){var t=!0;return"click"===l&&(t=!1!==u._16(n,15).toggleOpen()&&t),t},null,null)),u._3(15,16384,[[2,4]],0,m.c,[m.a,u.k],null,null),(n()(),u._23(-1,null,["\n        "])),(n()(),u._4(17,0,null,null,0,"span",[["class","fas fa-globe"]],null,null,null,null,null)),(n()(),u._23(18,null,[" ","\n      "])),(n()(),u._23(-1,null,["\n      "])),(n()(),u._4(20,0,null,null,5,"div",[["aria-labelledby","languageDropdown"],["class","dropdown-menu"],["ngbDropdownMenu",""]],[[2,"dropdown-menu",null],[2,"show",null]],null,null,null,null)),u._3(21,16384,[[1,4]],0,m.b,[m.a,u.k,u.C],null,null),(n()(),u._23(-1,null,["\n        "])),(n()(),u.Z(16777216,null,null,1,null,b)),u._3(24,802816,null,0,g.h,[u.N,u.K,u.q],{ngForOf:[0,"ngForOf"]},null),(n()(),u._23(-1,null,["\n      "])),(n()(),u._23(-1,null,["\n    "])),(n()(),u._23(-1,null,["\n  "])),(n()(),u._23(-1,null,["\n"])),(n()(),u._23(-1,null,["\n\n"])),(n()(),u._4(30,0,null,null,4,"div",[["class","container py-5"]],null,null,null,null,null)),(n()(),u._23(-1,null,["\n  "])),(n()(),u._4(32,16777216,null,null,1,"router-outlet",[],null,null,null,null,null)),u._3(33,212992,null,0,f.n,[f.b,u.N,u.j,[8,null],u.h],null,null),(n()(),u._23(-1,null,["\n"])),(n()(),u._23(-1,null,["\n"]))],function(n,l){var e=l.component;n(l,5,0,"/"),n(l,6,0,""),n(l,10,0,"bottom-right"),n(l,24,0,e.locales),n(l,33,0)},function(n,l){var e=l.component;n(l,4,0,u._16(l,5).target,u._16(l,5).href),n(l,9,0,u._16(l,10).isOpen()),n(l,14,0,u._16(l,15).dropdown.isOpen()),n(l,18,0,e.currentLocale.text),n(l,20,0,!0,u._16(l,21).dropdown.isOpen())})}var y=u._0("app-nav",h,function(n){return u._24(0,[(n()(),u._4(0,0,null,null,1,"app-nav",[],null,null,null,w,v)),u._3(1,114688,null,0,h,[t.h],null,null)],function(n,l){n(l,1,0)},null)},{},{},[]),k=e("AP4T"),x=e("9iV4"),S=function(){function n(n){this.http=n,this.url="https://allorigins.me/get",this.params=function(n,l){return new x.g({fromObject:{url:"https://www.google.com/search?q="+encodeURIComponent(l)+"&hl="+n}})},this.groupingSeparator=function(n){return 12345..toLocaleString(n).match(/12(.*)345/)[1]},this.localizedNumberPattern=function(n){return new RegExp("\\d{1,3}("+n+"\\d{3})*")}}return n.prototype.getSearchResults=function(n,l){var e=this;return k.a.create(function(u){e.http.get(e.url,{params:e.params(l,n)}).subscribe(function(t){var a=(new DOMParser).parseFromString(t.contents,"text/html").getElementById("resultStats");if(a){var r=e.groupingSeparator(l),o=e.localizedNumberPattern(r).exec(a.innerHTML)[0].replace(new RegExp("\\"+r,"g"),"");u.next(parseInt(o)),u.complete()}else u.error('Unable to get number of search results for "'+n+'"'),u.complete()})})},n}(),C=function(){function n(n){this.http=n,this.url=function(n){return"https://"+n+".wikipedia.org/w/api.php"},this.params=function(n){return new x.g({fromObject:{action:"query",format:"json",list:"random",rnnamespace:"0",rnlimit:String(Math.min(Math.max(1,n),10)),origin:"*"}})}}return n.prototype.getRandomTitles=function(n,l){var e=this;return k.a.create(function(u){e.http.get(e.url(l),{params:e.params(n)}).subscribe(function(n){var l=[];n.query.random.forEach(function(n){return l.push(n.title)}),u.next(l),u.complete()})})},n}(),L=function(){function n(n,l){this.googleService=n,this.wikipediaService=l}return n.prototype.newGame=function(n,l){var e=this;return k.a.create(function(u){e.wikipediaService.getRandomTitles(n,l).subscribe(function(n){var t=[];n.forEach(function(n){return e.googleService.getSearchResults(n,l).subscribe(function(l){t.push(new function(n,l){this.title=n,this.searchResults=l}(n,l))},function(n){console.error(n)})}),u.next(t),u.complete()})})},n}(),O=function(){function n(n,l){this.localeService=n,this.gameService=l,this.words=[]}return n.prototype.newGame=function(){var n=this,l=this.localeService.getCurrentLanguage();this.gameService.newGame(5,l).subscribe(function(l){return n.words=l})},n}(),j=u._2({encapsulation:2,styles:[],data:{}});function T(n){return u._24(0,[(n()(),u._4(0,0,null,null,8,"li",[["class","list-group-item d-flex justify-content-between"]],null,null,null,null,null)),(n()(),u._23(-1,null,["\n    "])),(n()(),u._4(2,0,null,null,1,"span",[],null,null,null,null,null)),(n()(),u._23(3,null,["",""])),(n()(),u._23(-1,null,["\n    "])),(n()(),u._4(5,0,null,null,2,"span",[["class","text-muted"],["l10nDecimal",""]],null,null,null,null,null)),u._3(6,4866048,null,0,t.e,[t.h,u.k,u.C],{l10nDecimal:[0,"l10nDecimal"]},null),(n()(),u._23(7,null,["",""])),(n()(),u._23(-1,null,["\n  "]))],function(n,l){n(l,6,0,"")},function(n,l){n(l,3,0,l.context.$implicit.title),n(l,7,0,l.context.$implicit.searchResults)})}function D(n){return u._24(0,[(n()(),u._4(0,0,null,null,2,"button",[["class","btn btn-primary mb-3"],["l10nTranslate",""],["type","button"]],null,[[null,"click"]],function(n,l,e){var u=!0;return"click"===l&&(u=!1!==n.component.newGame()&&u),u},null,null)),u._3(1,4866048,null,0,t.n,[t.r,u.k,u.C],{l10nTranslate:[0,"l10nTranslate"]},null),(n()(),u._23(-1,null,["New Game"])),(n()(),u._23(-1,null,["\n"])),(n()(),u._4(4,0,null,null,4,"ul",[["class","list-group"]],null,null,null,null,null)),(n()(),u._23(-1,null,["\n  "])),(n()(),u.Z(16777216,null,null,1,null,T)),u._3(7,802816,null,0,g.h,[u.N,u.K,u.q],{ngForOf:[0,"ngForOf"]},null),(n()(),u._23(-1,null,["\n"])),(n()(),u._23(-1,null,["\n"]))],function(n,l){var e=l.component;n(l,1,0,""),n(l,7,0,e.words)},null)}var F=u._0("app-game",O,function(n){return u._24(0,[(n()(),u._4(0,0,null,null,1,"app-game",[],null,null,null,D,j)),u._3(1,49152,null,0,O,[t.h,L],null,null)],null,null)},{},{},[]),E=e("0nO6"),K=e("dN2u"),N=e("KRwK"),R=function(){function n(n){this.l10nLoader=n}return n.prototype.resolve=function(n,l){return this.l10nLoader.load()},n}(),M=e("Zz+K"),I=e("wnyu"),U=e("tzcA"),q=e("2waW"),P=e("PY9B"),z=e("IBeK"),G=e("g5gQ"),B=e("xBEz"),H=e("PuIS"),W=e("U0Tu"),Z=e("3rU7"),$=e("Cb36"),A=e("5h8W"),Q=e("6ade"),V=e("4HaF"),Y=e("DaIH"),J=e("0WLp"),X=function(){},nn=function(){};e.d(l,"GameModuleNgFactory",function(){return ln});var ln=u._1(a,[],function(n){return u._12([u._13(512,u.j,u.X,[[8,[r.a,o.a,i.a,c.a,s.a,_.a,p.a,y,F]],[3,u.j],u.v]),u._13(4608,g.k,g.j,[u.s,[2,g.p]]),u._13(4608,E.f,E.f,[]),u._13(4608,K.a,K.a,[u.j,u.p,N.a]),u._13(4608,t.r,t.r,[t.m,t.h,t.q,t.o]),u._13(4608,t.f,t.f,[t.g,t.m,t.h,t.r]),u._13(4608,R,R,[t.f]),u._13(4608,S,S,[x.c]),u._13(4608,C,C,[x.c]),u._13(4608,L,L,[S,C]),u._13(512,g.b,g.b,[]),u._13(512,t.d,t.d,[u.p]),u._13(512,t.p,t.p,[t.d]),u._13(512,t.j,t.j,[t.d]),u._13(512,f.m,f.m,[[2,f.r],[2,f.k]]),u._13(512,M.a,M.a,[]),u._13(512,I.a,I.a,[]),u._13(512,U.a,U.a,[]),u._13(512,q.a,q.a,[]),u._13(512,P.a,P.a,[]),u._13(512,E.e,E.e,[]),u._13(512,E.a,E.a,[]),u._13(512,z.a,z.a,[]),u._13(512,G.a,G.a,[]),u._13(512,B.a,B.a,[]),u._13(512,H.a,H.a,[]),u._13(512,W.a,W.a,[]),u._13(512,Z.a,Z.a,[]),u._13(512,$.a,$.a,[]),u._13(512,A.a,A.a,[]),u._13(512,Q.a,Q.a,[]),u._13(512,V.a,V.a,[]),u._13(512,Y.a,Y.a,[]),u._13(512,J.a,J.a,[]),u._13(512,X,X,[]),u._13(512,nn,nn,[]),u._13(512,a,a,[]),u._13(256,t.m,{providers:[{type:1,prefix:"./assets/locale-"},{type:1,prefix:"./assets/locale-game-"}],missingValue:"No key"},[]),u._13(1024,f.i,function(){return[[{path:"",component:h,resolve:{void:R},children:[{path:"",component:O}]}]]},[])])})}});