/*** Init and Variables ***/
var inputs = document.querySelectorAll("input");
var bottom_texts = document.getElementsByClassName("bottom-text");
var project_divs = document.querySelectorAll(".project");
var projects_column = document.getElementsByClassName("projects-container");

bottom_texts[0].classList.add("active");

/*** Event Listeners ***/

for (var i = 0; i < inputs.length; i++) {
  var projectYPos = project_divs[i].offsetTop;
  inputs[i].addEventListener("click", scroll(document.body, project_divs[i], 10), false);
}

var currIndex, prevIndex = -1;

var getCurrentProject = debounce(function() {
  var max = -1;

  for (var i = 0; i < project_divs.length; i++) {
    curr_px = pixelsInViewport(project_divs[i]);
    if (max < curr_px) {
      max = curr_px;
      currIndex = i;
    }
  }

  if (currIndex != prevIndex) {
    var active_list = document.getElementsByClassName("active");
    for (var i = 0; i < active_list.length; i++) {
      active_list[i].classList.remove("active");
    }
    bottom_texts[currIndex].classList.add("active");
    prevIndex = currIndex;
  }
}, 150);
window.addEventListener('scroll', getCurrentProject);

window.addEventListener('resize', function() {
  for (var i = 0; i < inputs.length; i++) {
    var projectYPos = project_divs[i].offsetTop;
    inputs[i].addEventListener("click", scroll(document.body, projectYPos, 10), false);
  }
});

/*** Functions ***/

function scroll(element, destination, duration) {
  return function() {
    projects_column[0].classList.add("fadeIn");
    
    if (destination.offsetHeight > window.innerHeight) {
      setTimeout(function() {
        destination.scrollIntoView();
      }, 100);
    } else {
      var distanceToCenter = (window.innerHeight - destination.offsetHeight) / 2;
      setTimeout(function() {
        window.scrollTo(0, destination.offsetTop - distanceToCenter);
      }, 100);
    }

    setTimeout(function() {
      projects_column[0].classList.remove("fadeIn");
    }, 2700);
  };
}

function pixelsInViewport(element) {
  var viewportHeight = window.innerHeight;
  var rect = element.getBoundingClientRect(),
    height = rect.bottom - rect.top,
    visible = {
      top: rect.top >= 0 && rect.top < viewportHeight,
      bottom: rect.bottom > 0 && rect.bottom < viewportHeight
    },
    visiblePx = 0;

  if ( visible.top && visible.bottom ) {
    // Whole element is visible
    visiblePx = height;
  } else if ( visible.top ) {
    visiblePx = viewportHeight - rect.top;
  } else if ( visible.bottom ) {
    visiblePx = rect.bottom;
  } else if ( height > viewportHeight && rect.top < 0 ) {
    var absTop = Math.abs( rect.top );

    if ( absTop < height ) {
      // Part of the element is visible
      visiblePx = height - absTop;
    }
  }

  return visiblePx;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};