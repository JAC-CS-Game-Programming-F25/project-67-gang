/**
 * UIRenderer - Sci-fi styled UI rendering utilities
 * Provides consistent, polished UI elements matching the space aesthetic
 */

import { context, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

const UIRenderer = {
	// Color palette
	colors: {
		primary: '#00ffff',      // Cyan
		secondary: '#ff00ff',    // Magenta
		accent: '#ffff00',       // Yellow
		success: '#00ff88',      // Green
		danger: '#ff4444',       // Red
		warning: '#ffaa00',      // Orange
		text: '#ffffff',         // White
		textDim: '#888888',      // Gray
		textDark: '#444444',     // Dark gray
		background: '#0a0a1a',   // Dark blue-black
		panel: 'rgba(10, 20, 40, 0.9)',
		panelBorder: '#00ffff'
	},

	/**
	 * Render animated space background
	 */
	renderSpaceBackground(time = Date.now()) {
		// Gradient background
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
		);
		gradient.addColorStop(0, '#12122a');
		gradient.addColorStop(0.5, '#0a0a1a');
		gradient.addColorStop(1, '#050510');
		
		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Animated stars
		context.save();
		for (let i = 0; i < 80; i++) {
			const x = (i * 73 + time * 0.01) % CANVAS_WIDTH;
			const y = (i * 47) % CANVAS_HEIGHT;
			const size = (i % 3) + 1;
			const alpha = 0.3 + Math.sin(time * 0.003 + i) * 0.3;
			
			context.globalAlpha = alpha;
			context.fillStyle = '#ffffff';
			context.beginPath();
			context.arc(x, y, size, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();

		// Subtle grid
		context.save();
		context.strokeStyle = '#1a1a3a';
		context.lineWidth = 1;
		context.globalAlpha = 0.2;
		
		for (let x = 0; x <= CANVAS_WIDTH; x += 100) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, CANVAS_HEIGHT);
			context.stroke();
		}
		for (let y = 0; y <= CANVAS_HEIGHT; y += 100) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(CANVAS_WIDTH, y);
			context.stroke();
		}
		context.restore();
	},

	/**
	 * Render glowing title text
	 */
	renderTitle(text, x, y, color = this.colors.primary, size = 60) {
		context.save();
		
		// Outer glow
		context.font = `bold ${size}px Orbitron`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.shadowColor = color;
		context.shadowBlur = 30;
		context.fillStyle = color;
		context.fillText(text, x, y);
		
		// Inner bright layer
		context.shadowBlur = 15;
		context.fillStyle = '#ffffff';
		context.globalAlpha = 0.3;
		context.fillText(text, x, y);
		
		context.restore();
	},

	/**
	 * Render subtitle text
	 */
	renderSubtitle(text, x, y, color = this.colors.text, size = 24) {
		context.save();
		context.font = `${size}px Orbitron`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = color;
		context.shadowColor = color;
		context.shadowBlur = 5;
		context.fillText(text, x, y);
		context.restore();
	},

	/**
	 * Render body text
	 */
	renderText(text, x, y, color = this.colors.text, size = 18, align = 'center') {
		context.save();
		context.font = `${size}px Roboto`;
		context.textAlign = align;
		context.textBaseline = 'middle';
		context.fillStyle = color;
		context.fillText(text, x, y);
		context.restore();
	},

	/**
	 * Render a glowing button/option
	 */
	renderButton(text, x, y, isActive = false, color = this.colors.primary) {
		context.save();
		
		const padding = 20;
		context.font = '22px Orbitron';
		const textWidth = context.measureText(text).width;
		const width = textWidth + padding * 2;
		const height = 45;
		
		// Button background
		context.fillStyle = isActive ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)';
		context.strokeStyle = isActive ? color : this.colors.textDim;
		context.lineWidth = isActive ? 2 : 1;
		
		if (isActive) {
			context.shadowColor = color;
			context.shadowBlur = 15;
		}
		
		// Rounded rectangle
		const rx = x - width / 2;
		const ry = y - height / 2;
		context.beginPath();
		context.roundRect(rx, ry, width, height, 5);
		context.fill();
		context.stroke();
		
		// Text
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = isActive ? color : this.colors.textDim;
		context.fillText(text, x, y);
		
		context.restore();
	},

	/**
	 * Render a sci-fi panel
	 */
	renderPanel(x, y, width, height, title = null) {
		context.save();
		
		// Panel background
		context.fillStyle = this.colors.panel;
		context.strokeStyle = this.colors.panelBorder;
		context.lineWidth = 2;
		context.shadowColor = this.colors.panelBorder;
		context.shadowBlur = 10;
		
		// Main panel
		context.beginPath();
		context.roundRect(x, y, width, height, 8);
		context.fill();
		context.stroke();
		
		// Corner accents
		context.shadowBlur = 0;
		context.fillStyle = this.colors.panelBorder;
		const cornerSize = 8;
		// Top-left
		context.fillRect(x, y, cornerSize, 2);
		context.fillRect(x, y, 2, cornerSize);
		// Top-right
		context.fillRect(x + width - cornerSize, y, cornerSize, 2);
		context.fillRect(x + width - 2, y, 2, cornerSize);
		// Bottom-left
		context.fillRect(x, y + height - 2, cornerSize, 2);
		context.fillRect(x, y + height - cornerSize, 2, cornerSize);
		// Bottom-right
		context.fillRect(x + width - cornerSize, y + height - 2, cornerSize, 2);
		context.fillRect(x + width - 2, y + height - cornerSize, 2, cornerSize);
		
		// Title bar
		if (title) {
			context.fillStyle = 'rgba(0, 255, 255, 0.1)';
			context.fillRect(x + 2, y + 2, width - 4, 30);
			
			context.font = '16px Orbitron';
			context.textAlign = 'center';
			context.fillStyle = this.colors.primary;
			context.fillText(title, x + width / 2, y + 18);
		}
		
		context.restore();
	},

	/**
	 * Render a progress bar
	 */
	renderProgressBar(x, y, width, height, value, maxValue, color = this.colors.success, showText = true) {
		context.save();
		
		const percent = Math.max(0, Math.min(1, value / maxValue));
		
		// Background
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fillRect(x, y, width, height);
		
		// Fill gradient
		const gradient = context.createLinearGradient(x, y, x + width * percent, y);
		gradient.addColorStop(0, color);
		gradient.addColorStop(1, this.lightenColor(color, 30));
		context.fillStyle = gradient;
		context.shadowColor = color;
		context.shadowBlur = 8;
		context.fillRect(x, y, width * percent, height);
		
		// Border
		context.shadowBlur = 0;
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.strokeRect(x, y, width, height);
		
		// Text
		if (showText) {
			context.font = `${height - 4}px Roboto`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = '#ffffff';
			context.fillText(`${Math.ceil(value)}/${maxValue}`, x + width / 2, y + height / 2);
		}
		
		context.restore();
	},

	/**
	 * Render stat line with icon
	 */
	renderStat(label, value, x, y, color = this.colors.primary, icon = '►') {
		context.save();
		
		// Icon
		context.font = '14px Roboto';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.fillText(icon, x, y);
		
		// Label
		context.fillStyle = this.colors.textDim;
		context.fillText(label + ':', x + 20, y);
		
		// Value
		context.fillStyle = this.colors.text;
		context.font = 'bold 14px Orbitron';
		context.fillText(value, x + 120, y);
		
		context.restore();
	},

	/**
	 * Render animated prompt text
	 */
	renderPrompt(text, x, y, time = Date.now()) {
		context.save();
		
		const alpha = 0.5 + Math.sin(time * 0.005) * 0.5;
		context.globalAlpha = alpha;
		context.font = '20px Orbitron';
		context.textAlign = 'center';
		context.fillStyle = this.colors.primary;
		context.shadowColor = this.colors.primary;
		context.shadowBlur = 10;
		context.fillText(text, x, y);
		
		context.restore();
	},

	/**
	 * Render key hint
	 */
	renderKeyHint(key, action, x, y) {
		context.save();
		
		// Key box
		context.font = '14px Orbitron';
		const keyWidth = context.measureText(key).width + 16;
		
		context.fillStyle = 'rgba(0, 255, 255, 0.2)';
		context.strokeStyle = this.colors.primary;
		context.lineWidth = 1;
		context.beginPath();
		context.roundRect(x, y - 12, keyWidth, 24, 4);
		context.fill();
		context.stroke();
		
		// Key text
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = this.colors.primary;
		context.fillText(key, x + keyWidth / 2, y);
		
		// Action text
		context.font = '14px Roboto';
		context.textAlign = 'left';
		context.fillStyle = this.colors.textDim;
		context.fillText(action, x + keyWidth + 10, y);
		
		context.restore();
	},

	/**
	 * Lighten a hex color
	 */
	lightenColor(color, percent) {
		const num = parseInt(color.replace('#', ''), 16);
		const amt = Math.round(2.55 * percent);
		const R = (num >> 16) + amt;
		const G = (num >> 8 & 0x00FF) + amt;
		const B = (num & 0x0000FF) + amt;
		return '#' + (
			0x1000000 +
			(R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
			(G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
			(B < 255 ? B < 1 ? 0 : B : 255)
		).toString(16).slice(1);
	}
};

export default UIRenderer;

