/**
 * 1.可让用户配置选项
 *  $('form').validate({
 *    defaultEvent: 'change'  // 自定义校验触发事件
 *  })
 * 2.至少包含4种表单校验方式
 *  a)身份证
 *  b)手机
 *  c)email
 *  d)必填字段
 *  e)最大值/最小值校验
 */
(function ($) {
  $.fn.validEmail = function(options) {
  	options = options || {};
  	var on = options.on;
  	var success = options.success || (function(){});
  	var failure = options.failure || (function(){});
  	var testInitially = options.testInitially || false;

  	var $input = $(this);

  	function check($input) {
  		if($input.is("input,textarea")) {
  			var emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  			return emailRegExp.test($input.val());
  		} else {
  			return false;
	  	}

  	}

  	function applyCode($input) {
  		check($input) ? success.call($input.get(0)) : failure.call($input.get(0));
  	}
	
  	if (typeof on === "string")
  		$input.bind(on, function() { applyCode($(this)); });

  	if (testInitially) $input.each(function() { applyCode($(this)); });
  	return check($input);
  };
})(jQuery);
