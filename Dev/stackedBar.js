var KOSITV;
if (!KOSITV) KOSITV = {};
if (!KOSITV.StackedBar) KOSITV.StackedBar = {};

KOSITV.StackedBar = function(pCanvasId) {
  var RGBA = [
    "rgba(200, 64, 43, 0.64)",
    "rgba(37, 195, 43, 0.64)",
    "rgba(84, 64, 201, 0.64)",
    "rgba(112, 245, 236, 0.64)",
    "rgba(141, 98, 131, 0.64)",
    "rgba(141, 98, 22, 0.64)",
    "rgba(180, 232, 22, 0.64)",
    "rgba(97, 103, 50, 0.64)",
    "rgba(255, 101, 161, 0.64)",
    "rgba(255, 62, 40, 0.64)"
  ];

  var CFG = {
    ctxWholeWidth: 0,
    ctxWholeHeight: 0,
    ctxAvailableWidth: 0,
    ctxAvailableHeight: 0,
    ctxTopMargin: 0,
    ctxBottomMargin: 0,
    ctxLeftMargin: 0,
    ctxStartX: 0,
    ctxStartY: 0,
    dataCount: 0,
    dataMaxHeight: 0,
    boxRightMargin: 0,
    boxWidth: 0,
    guideColorAlpha: 0, //Stacted Bar Guide line alpha value
    guideFillYN: "N", //Stacted Bar Guide line to fill or to stroke
    onlyGroupBox: "N", //Only show group box
    eventObject: [{ type: "C", x: 0, y: 0, w: 0, h: 0 }],
    ctx: null
  };

  var SEQ = [];

  var fnSetConfig = function(w, h, dataprop, OPT) {
    var ctxTotalWidth = w; //전체 Canvas 가로 크기
    var ctxTotalHeight = h; //전체 Canvas 세로 크기

    var ctxTopMargin = 30; //상단 여백
    var ctxBottomMargin = 60; //하단 여백
    var ctxLeftMargin = 50; //좌 여백
    var ctxRightMargin = 60; //우 여백

    var ctxAvailableWidth = ctxTotalWidth - ctxLeftMargin - ctxRightMargin; //우 여백 차감
    var ctxAvailableHeight = ctxTotalHeight - ctxTopMargin - ctxBottomMargin; //상단 여백 차감
    var ctxAvailableXPoint = 0 + ctxLeftMargin; //Point 시작 X점
    var ctxAvailableYPoint = 0 + ctxTopMargin; //Point 시작 Y점

    var dataWidthCount = dataprop.count;
    var dataMaxHeight = dataprop.maxValue;

    //box margin 동적 계산
    var calcBoxWidth = Math.round(ctxAvailableWidth / dataWidthCount);
    var boxRightMargin = Math.floor(calcBoxWidth * 11 / 32); //      11/32 %
    var boxWidth = calcBoxWidth - boxRightMargin;

    CFG = {
      ctxWholeWidth: ctxTotalWidth,
      ctxWholeHeight: ctxTotalHeight,
      ctxAvailableWidth: ctxAvailableWidth,
      ctxAvailableHeight: ctxAvailableHeight,
      ctxTopMargin: ctxTopMargin,
      ctxBottomMargin: ctxBottomMargin,
      ctxLeftMargin: ctxLeftMargin,
      ctxRightMargin: ctxRightMargin,
      ctxStartX: ctxAvailableXPoint,
      ctxStartY: ctxAvailableYPoint,
      dataCount: dataWidthCount,
      dataMaxHeight: dataMaxHeight,
      boxRightMargin: boxRightMargin,
      boxWidth: boxWidth,
      guideColorAlpha: (OPT.GuideAlpha =
        typeof OPT.GuideAlpha !== "undefined" ? OPT.GuideAlpha : 0.2),
      guideFillYN: (OPT.GuideFillYN =
        typeof OPT.GuideFillYN !== "undefined" ? OPT.GuideFillYN : "N"),
      onlyGroupBox: (OPT.OnlyGroupBox =
        typeof OPT.OnlyGroupBox !== "undefined" ? OPT.OnlyGroupBox : "N"),
      eventObject: [{ type: "C", x: 0, y: 0, w: 0, h: 0 }]
    };
    //console.log(CFG);
  };

  //Draw background
  var fnDrawBackground = function(ctx, prop, rgb) {
    ctx.fillStyle = rgb;
    ctx.fillRect(prop.X, prop.Y, prop.W, prop.H);
  };

  //# make axis X,Y
  var fnMakeGroupPosition = function(maxValue, arrGroup) {
    var maxCanvasHeight = CFG.ctxAvailableHeight; //여백을 제외한 Canvas 사용 총 높이
    //var maxDataY = dataSet.slice(0).sort().reverse()[0];
    var maxDataY = maxValue;
    var dataGroup = arrGroup;

    var BoxesAxis = [];
    var stdLeftMargin = 20;

    var boxWidth = CFG.boxWidth;
    var tmpXAxis = CFG.ctxStartX + stdLeftMargin;

    for (var i = 0; i < dataGroup.length; i++) {
      var arr = {
        idx: i,
        X: tmpXAxis,
        Y:
          (maxDataY - dataGroup[i]) / maxDataY * maxCanvasHeight +
          CFG.ctxStartY,
        W: boxWidth,
        H: dataGroup[i] / maxDataY * maxCanvasHeight
      }; //X축 계산
      BoxesAxis.push(arr);
      tmpXAxis += CFG.boxWidth + CFG.boxRightMargin;
    }

    //console.log(BoxesAxis);
    return BoxesAxis;
  };

  //Get max data value, Get data count
  var fnGetDataProp = function(data) {
    //X축의 Count
    var nDataCnt = data.length;
    //X축별 Data sum array
    var arrValues = [];
    var sumValue = 0;
    for (var i = 0; i < nDataCnt; i++) {
      sumValue = data[i].reduce((x, y) => x + y); //Group value sum
      arrValues.push(parseInt(sumValue));
    }
    var maxDataValue = arrValues.slice(0).sort(function(a, b) {
      return b - a;
    })[0]; //ValueGroup Max value

    var dataProp = {
      maxValue: maxDataValue,
      count: nDataCnt,
      valueGroup: arrValues
    };

    //console.log("##### prop");
    //console.log(dataProp);
    return dataProp;
  };

  //# make axis
  var fnDrawAxis = function(ctx) {
    //X-Axis
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.moveTo(CFG.ctxLeftMargin, CFG.ctxTopMargin + CFG.ctxAvailableHeight);
    ctx.lineTo(
      CFG.ctxLeftMargin + CFG.ctxAvailableWidth,
      CFG.ctxTopMargin + CFG.ctxAvailableHeight
    );
    ctx.lineWidth = 0.6;
    //ctx.closePath();
    ctx.stroke();
    //ctx.fill();

    //Y-Axis
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.moveTo(CFG.ctxLeftMargin, CFG.ctxTopMargin);
    ctx.lineTo(CFG.ctxLeftMargin, CFG.ctxTopMargin + CFG.ctxAvailableHeight);
    ctx.lineWidth = 0.6;
    //ctx.closePath();
    ctx.stroke();
  };

  var cmmManageSeqId = function() {
    if (SEQ.length == 0) {
      return 0;
    } else {
      return SEQ.length;
    }
  };

  //객체의 Property 존재여부 체크
  var cmmCheckProperty = function(obj) {
    var result = true;
    var temp = "";
    try {
      temp = obj;
    } catch (e) {
      result = false;
    }
    return result;
  };

  //Canvas ID
  //Data Set
  //Option
  var stackedBarGuide = {
    _CFG: CFG,
    _canvas: null,
    _ctx: null,
    _canvasCfg: { width: 0, height: 0 },
    _label: null,
    _legend: null,
    _MO: {
      dtOrgDataSet: [],
      dtGroup: { maxValue: 0, colCnt: 0, rowCnt: 0 },
      dtBoxGroup: [], //Group별 value의 합계 배열
      dtGroupPos: [], //Group별 시작 Position, 가로/세로 크기 배열 attributes
      dtBoxPos: [] //개별 Box별 시작 Position, 가로/세로 크기 배열 attributes
    },
    _opt: {},
    _initCtx: function() {
      var resultFlag = true;
      if (pCanvasId.length == 0) {
        resultFlag = false;
      } else {
        //Canvas Element 생성
        var canvas = document.getElementById(pCanvasId);

        if (typeof canvas === "undefined" || canvas == null) {
          resultFlag = false;
        } else {
          //Context 생성
          this._canvas = canvas;
          this._ctx = canvas.getContext("2d");

          //Canvas Width/Height 설정
          this._canvasCfg = {
            width: this._canvas.width,
            height: this._canvas.height
          };
        }
      }
      return resultFlag;
    },
    _setData: function(pData) {
      var result = true;

      //JSON Data setting
      try {
        var json = JSON.parse(pData);

        var data = json.data;
        this._label = json.title[0].label;
        this._legend = json.title[0].legend;

        this._MO.dtOrgDataSet = data;

        var dataSet = fnGetDataProp(data);
        this._MO.dtGroup = {
          maxValue: dataSet.maxValue,
          colCnt: dataSet.count,
          rowCnt: data[0].length
        };
        this._MO.dtBoxGroup = dataSet.valueGroup;
      } catch (e) {
        alert("JSON Data syntax error!");
        result = false;
      }

      return result;
    },
    _setOption: function(opt) {
      var options = {
        GuideAlpha: 0.2,
        GuideFillYN: "N",
        UseComment: "N",
        UseGuideLine: "Y",
        OnlyGroupBox: "N"
      };

      if (typeof opt !== "undefined" && opt != null) {
        if (cmmCheckProperty(opt.guideAlpha))
          options.GuideAlpha = opt.guideAlpha;
        if (cmmCheckProperty(opt.guideFillYN))
          options.GuideFillYN = opt.guideFillYN;
        if (cmmCheckProperty(opt.useComment))
          options.UseComment = opt.useComment;
        if (cmmCheckProperty(opt.useGuideLine))
          options.UseGuideLine = opt.useGuideLine;
        if (cmmCheckProperty(opt.onlyGroupBox))
          options.OnlyGroupBox = opt.onlyGroupBox;
      }
      this._opt = options;
    },
    _event: function() {
      $(this._canvas)
        .on("mousemove", function(e) {
          //console.log(e.pageX, e.pageY);
          //ctx.fnEventHandler(e.pageX, e.pageY);
          //console.log(e.pageX + "," + e.pageY);
        })
        .on("mouseout", function() {
          //console.log("out");
        })
        .on("click", function() {});
    },
    init: function(pData, pOption) {
      //# 1.init Canvas,Context
      if (!this._initCtx()) {
        alert("Check the Canvas ID!");
        return;
      }
      //# 2.Set JSON Data
      if (!this._setData(pData)) return;
      //console.log(this._ctx);

      //# 3.Check option
      this._setOption(pOption);

      //# 4.Set Config
      fnSetConfig(
        this._canvasCfg.width,
        this._canvasCfg.height,
        { count: this._MO.dtGroup.colCnt, maxValue: this._MO.dtGroup.maxValue },
        this._opt
      );

      CFG.ctx = this._ctx;

      //Canvas arae
      var prop = {
        X: 0,
        Y: 0,
        W: this._canvasCfg.width,
        H: this._canvasCfg.height
      };

      var boxProp = {
        id: cmmManageSeqId(),
        X: 0,
        Y: 0,
        W: this._canvasCfg.width,
        H: this._canvasCfg.height,
        reb: "rgba(244, 245, 186, 0.2)"
      };
      SEQ.push(boxProp);
      fnDrawBackground(this._ctx, prop, "rgba(244, 245, 186, 0.2)");

      //real chart arae
      prop = {
        X: CFG.ctxStartX,
        Y: CFG.ctxStartY,
        W: CFG.ctxAvailableWidth,
        H: CFG.ctxAvailableHeight
      };
      //fnDrawBackground(this._ctx, prop, "rgba(244, 245, 136, 0.64)");

      //Make Axis
      fnDrawAxis(this._ctx);

      //Make Box List
      //Group별 위치/크기 설정
      this._MO.dtGroupPos = fnMakeGroupPosition(
        this._MO.dtGroup.maxValue,
        this._MO.dtBoxGroup
      );

      console.log(this._MO.dtGroupPos);

      // Draw Label
      //fnDrawLable(this._ctx, this._label, this._MO.dtGroupPos);

      // Draw Legend
      //fnDrawLegend(this._ctx, this._legend);

      // Draw Group box
      //fnDrawGroupBox(this._ctx, this._MO);

      //Draw Box guide line
      //if (this._opt.UseGuideLine == "Y")
      //fnCallDrawGuide(this._ctx, this._MO.dtBoxPos);

      //Comment Box
      //if (this._opt.UseComment == "Y") fnDrawComment(this._ctx);

      //this._event();
    }
  };

  return stackedBarGuide;
};
