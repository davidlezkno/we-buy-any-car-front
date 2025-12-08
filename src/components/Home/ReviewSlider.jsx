// ReviewSlider renders the horizontal scroll of Trustpilot reviews with identical interactions.
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { REVIEW_ITEMS } from "../../utils/homeContent";

const ReviewSlider = () => {
  const reviewsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!reviewsRef.current) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = reviewsRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const container = reviewsRef.current;
    if (!container) {
      return undefined;
    }
    container.addEventListener("scroll", updateScrollState);
    return () => container.removeEventListener("scroll", updateScrollState);
  }, []);

  const handleScroll = (direction) => {
    if (!reviewsRef.current) {
      return;
    }
    const containerWidth = reviewsRef.current.clientWidth;
    const isDesktop = containerWidth >= 768;
    const cardWidth = isDesktop ? containerWidth / 2 : containerWidth;
    const gap = 16;
    reviewsRef.current.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div id="wrapper-right" className="relative">
      <div
        id="review-arrow-left"
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 ${canScrollLeft ? "" : "hidden"}`}
        style={{ marginLeft: "8px" }}
      >
        <button
          id="tp-widget-previous-button"
          className="svg-slider-arrow w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer bg-white rounded-full shadow-lg"
          onClick={() => handleScroll(-1)}
          title="Previous"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle
              className="arrow-slider-circle"
              cx="12"
              cy="12"
              r="11.5"
              fill="none"
              stroke="#8C8C8C"
            />
            <path
              className="arrow-slider-shape"
              fill="#8C8C8C"
              d="M10.5088835 12l3.3080582-3.02451041c.2440777-.22315674.2440777-.5849653 0-.80812204-.2440776-.22315673-.6398058-.22315673-.8838834 0L9.18305826 11.595939c-.24407768.2231567-.24407768.5849653 0 .808122l3.75000004 3.4285714c.2440776.2231568.6398058.2231568.8838834 0 .2440777-.2231567.2440777-.5849653 0-.808122L10.5088835 12z"
            />
          </svg>
        </button>
      </div>

      <div
        id="review-arrow-right"
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 ${canScrollRight ? "" : "hidden"}`}
        style={{ marginRight: "8px" }}
      >
        <button
          id="tp-widget-next-button"
          className="svg-slider-arrow w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer bg-white rounded-full shadow-lg"
          onClick={() => handleScroll(1)}
          title="Next"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle
              className="arrow-slider-circle"
              cx="12"
              cy="12"
              r="11.5"
              fill="none"
              stroke="#8C8C8C"
            />
            <path
              className="arrow-slider-shape"
              fill="#8C8C8C"
              transform="rotate(180 12 12)"
              d="M10.5088835 12l3.3080582-3.02451041c.2440777-.22315674.2440777-.5849653 0-.80812204-.2440776-.22315673-.6398058-.22315673-.8838834 0L9.18305826 11.595939c-.24407768.2231567-.24407768.5849653 0 .808122l3.75000004 3.4285714c.2440776.2231568.6398058.2231568.8838834 0 .2440777-.2231567.2440777-.5849653 0-.808122L10.5088835 12z"
            />
          </svg>
        </button>
      </div>

      <div id="tp-widget-reviews-wrapper" className="overflow-hidden">
        <ul
          id="tp-widget-reviews"
          ref={reviewsRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {REVIEW_ITEMS.map((review, index) => (
            <li
              key={review.header + "-" + index}
              className="tp-widget-review flex-shrink-0 w-full md:w-[calc(50%-0.5rem)]"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md h-full">
                <div className="top-row mb-3">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={`${review.header}-${starIndex}`}
                        className="w-4 h-4"
                        style={{ fill: "#20B24D", color: "#20B24D" }}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">Verified</span>
                  </div>
                </div>
                <a
                  href={`https://www.trustpilot.com/reviews/${index}`}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="tp-widget-review-link block"
                >
                  <div className="tp-widget-review-content">
                    <div className="header font-bold text-gray-900 mb-2">
                      {review.header}
                    </div>
                    <div className="text text-gray-700 mb-4">{review.text}</div>
                    <div className="date-and-user-info-wrapper flex gap-2 text-sm text-gray-600">
                      <div className="name">{review.name},</div>
                      <div className="date">{review.date}</div>
                    </div>
                  </div>
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className="tp-widget-reviews-filter-label text-center text-sm text-gray-600 mt-4">
          Showing our favorite reviews
        </div>
      </div>
    </div>
  );
};

export default ReviewSlider;
