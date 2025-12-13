import Enemy from "./Enemy.js";
import { context } from "../globals.js";

export default class Boss extends Enemy {
	constructor(x, y, waveNumber) {
		// Bigger size for boss
		super(x, y, 80, 80);
		
		// Scale stats based on wave
		this.health = 200 + (waveNumber * 50); // Gets tankier each wave
		this.maxHealth = this.health;
		this.speed = 40; // Slower than normal enemies
		this.damage = 30;
		this.coinValue = 50; // Drops lots of coins
		this.color = '#ff0000'; // Red boss
		this.isBoss = true;
		
		// Boss-specific properties
		this.phase = 1;
		this.shootTimer = 0;
		this.shootCooldown = 2.0; // Shoots every 2 seconds
	}

	update(dt, player) {
		// Chase player
		this.chasePlayer(player, dt);
		
		// Boss phases based on health
		if (this.health < this.maxHealth * 0.5 && this.phase === 1) {
			this.phase = 2;
			this.speed = 60; // Speeds up at half health
			this.shootCooldown = 1.5; // Shoots faster
		}
		
		// Shooting behavior (optional - we can skip this for simplicity)
		this.shootTimer += dt;
		
		super.update(dt);
	}

    render() {
        // Draw boss as large red square
        context.save();
        context.fillStyle = this.color;
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 5;
        context.fillRect(
            this.position.x - pulse / 2, 
            this.position.y - pulse / 2, 
            this.dimensions.x + pulse, 
            this.dimensions.y + pulse
        );
        
        // Outline
        context.strokeStyle = '#ffffff';
        context.lineWidth = 3;
        context.strokeRect(
            this.position.x - pulse / 2, 
            this.position.y - pulse / 2, 
            this.dimensions.x + pulse, 
            this.dimensions.y + pulse
        );
        
        // Boss label 
        context.fillStyle = '#ffffff';
        context.font = '20px Orbitron';
        context.textAlign = 'center';
        context.fillText('BOSS', this.position.x + this.dimensions.x / 2, this.position.y - 60);
        
        context.restore();

        // Health bar (bigger for boss)
        this.renderBossHealthBar();
    }

    renderBossHealthBar() {
        const barWidth = 200;
        const barHeight = 8;
        const barX = this.position.x + this.dimensions.x / 2 - barWidth / 2;
        const barY = this.position.y - 50;

        // Background
        context.fillStyle = '#333333';
        context.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        context.fillStyle = '#ff0000';
        context.fillRect(barX, barY, healthWidth, barHeight);

        // Border
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        // Health text 
        context.fillStyle = '#ffffff';
        context.font = '12px Roboto';
        context.textAlign = 'center';
        context.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, barX + barWidth / 2, barY + barHeight + 18);
    }
}