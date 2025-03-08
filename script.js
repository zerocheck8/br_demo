document.addEventListener('DOMContentLoaded', function() {
    // 获取轮播元素
    const carousel = document.querySelector('.market-carousel');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const items = document.querySelectorAll('.market-item');
    
    // 根据屏幕大小确定可见数量
    function getVisibleItemCount() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 350) return 2; // 超小屏幕显示2个
        if (screenWidth <= 410) return 3; // 小屏幕显示3个
        if (screenWidth <= 576) return 4; // 中小屏幕显示4个
        if (screenWidth <= 768) return 5; // 平板显示5个
        if (screenWidth <= 1200) return 6; // 小桌面显示6个
        return 6; // 大屏幕显示6个
    }
    
    // 计算滑动宽度
    function updateCarouselMetrics() {
        const item = items[0];
        const style = window.getComputedStyle(item);
        const width = item.offsetWidth;
        const marginRight = parseInt(style.marginRight) || 0;
        const gap = parseInt(window.getComputedStyle(carousel).columnGap) || 12;
        
        return {
            itemWidth: width,
            gapWidth: gap,
            totalWidth: width + gap,
            visibleItems: getVisibleItemCount()
        };
    }
    
    let metrics = updateCarouselMetrics();
    let currentPosition = 0;
    let maxPosition = Math.max(0, items.length - metrics.visibleItems);
    
    // 为无限轮播克隆元素
    function setupInfiniteCarousel() {
        // 移除之前可能添加的克隆元素
        document.querySelectorAll('.market-item.clone').forEach(el => el.remove());
        
        // 克隆前几个元素并添加到末尾
        for (let i = 0; i < metrics.visibleItems; i++) {
            const clone = items[i].cloneNode(true);
            clone.classList.add('clone');
            carousel.appendChild(clone);
        }
    }
    
    setupInfiniteCarousel();
    
    // 滑动到指定位置的函数
    function slideToPosition(position) {
        // 限制位置范围
        if (position < 0) position = 0;
        if (position > maxPosition) position = maxPosition;
        
        currentPosition = position;
        const translateX = -position * metrics.totalWidth;
        carousel.style.transform = `translateX(${translateX}px)`;
    }
    
    // 滑动到下一个位置
    function slideNext() {
        if (currentPosition >= maxPosition) {
            // 如果到达末尾，快速回到开头
            carousel.style.transition = 'none';
            slideToPosition(0);
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease';
            }, 10);
        } else {
            slideToPosition(currentPosition + 1);
        }
    }
    
    // 滑动到上一个位置
    function slidePrev() {
        if (currentPosition <= 0) {
            // 如果在开头，快速滑到末尾
            carousel.style.transition = 'none';
            slideToPosition(maxPosition);
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease';
            }, 10);
        } else {
            slideToPosition(currentPosition - 1);
        }
    }
    
    // 添加按钮点击事件
    nextBtn.addEventListener('click', slideNext);
    prevBtn.addEventListener('click', slidePrev);
    
    // 自动轮播
    let autoSlideInterval = setInterval(slideNext, 3000);
    
    // 当鼠标悬停在轮播上时暂停自动轮播
    carousel.parentElement.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    // 当鼠标离开轮播时恢复自动轮播
    carousel.parentElement.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(slideNext, 3000);
    });
    
    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoSlideInterval);
    }, {passive: true});
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        autoSlideInterval = setInterval(slideNext, 3000);
    }, {passive: true});
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            slideNext(); // 左滑，显示下一个
        } else if (touchEndX > touchStartX + swipeThreshold) {
            slidePrev(); // 右滑，显示上一个
        }
    }
    
    // 窗口大小变化时更新轮播
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        
        // 使用防抖动来减少调用频率
        resizeTimeout = setTimeout(() => {
            const oldVisibleCount = metrics.visibleItems;
            metrics = updateCarouselMetrics();
            maxPosition = Math.max(0, items.length - metrics.visibleItems);
            
            // 如果可见数量改变，重新设置无限轮播
            if (oldVisibleCount !== metrics.visibleItems) {
                setupInfiniteCarousel();
            }
            
            // 确保当前位置有效
            if (currentPosition > maxPosition) {
                currentPosition = maxPosition;
            }
            
            slideToPosition(currentPosition);
        }, 200);
    });

    // 奖励开关功能
    const rewardsToggle = document.getElementById('rewards-toggle');
    const rewardsCard = document.querySelector('.rewards-card');

    if (rewardsToggle) {
        // 设置默认状态为开启
        rewardsToggle.checked = true;

        // 添加开关事件监听
        rewardsToggle.addEventListener('change', function() {
            if (this.checked) {
                // 开启状态
                rewardsCard.classList.add('active');
            } else {
                // 关闭状态
                rewardsCard.classList.remove('active');
            }
        });

        // 初始触发一次，设置初始状态
        rewardsToggle.dispatchEvent(new Event('change'));
    }

    // 奖励按钮点击效果
    const rewardsButton = document.querySelector('.rewards-button');
    if (rewardsButton) {
        rewardsButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 添加点击波纹效果
            const ripple = document.createElement('span');
            ripple.classList.add('button-ripple');
            this.appendChild(ripple);
            
            // 设置波纹位置
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            // 移除波纹元素
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // 这里可以添加其他功能，比如打开模态框等
            console.log('开始赚取收益按钮被点击');
        });
    }

    // 平台步骤动画效果
    const stepItems = document.querySelectorAll('.step-item');
    
    // 监听滚动事件，为步骤添加动画
    function animateSteps() {
        stepItems.forEach((step, index) => {
            // 延迟显示每个步骤
            setTimeout(() => {
                step.classList.add('animated');
            }, 300 * index);
        });
    }
    
    // 当页面滚动到步骤部分时触发动画
    function checkScroll() {
        const stepsContainer = document.querySelector('.steps-container');
        if (!stepsContainer) return;
        
        const rect = stepsContainer.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0);
        
        if (isVisible) {
            animateSteps();
            window.removeEventListener('scroll', checkScroll);
        }
    }
    
    // 初始检查
    checkScroll();
    
    // 添加滚动监听
    window.addEventListener('scroll', checkScroll);
    
    // 奖励部分数字动画效果
    function animateRewardStats() {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(stat => {
            // 获取原始数值
            const originalText = stat.textContent;
            const numericValue = parseFloat(originalText.replace(/[+%]/g, ''));
            
            // 设置计数起点
            let currentValue = 0;
            const duration = 1500; // 动画持续时间（毫秒）
            const interval = 16; // 刷新间隔（毫秒）
            const steps = duration / interval;
            const increment = numericValue / steps;
            
            // 开始动画计数
            const counter = setInterval(() => {
                currentValue += increment;
                
                // 如果超过目标值，设为目标值
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(counter);
                }
                
                // 更新显示
                stat.textContent = '+ ' + currentValue.toFixed(1) + '%';
            }, interval);
        });
    }
    
    // 检查奖励卡片是否在视图中
    function checkRewardsVisible() {
        const rewardsCard = document.querySelector('.rewards-card');
        if (!rewardsCard) return;
        
        const rect = rewardsCard.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0);
        
        if (isVisible) {
            animateRewardStats();
            window.removeEventListener('scroll', checkRewardsVisible);
        }
    }
    
    // 添加奖励卡片滚动监听
    window.addEventListener('scroll', checkRewardsVisible);
    // 初始检查奖励卡片
    checkRewardsVisible();
}); 