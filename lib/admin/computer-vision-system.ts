"use client"

// Computer Vision System for Real-time Exercise Form Analysis
// This module provides AI-powered posture correction and movement analysis

export interface JointPosition {
  x: number
  y: number
  confidence: number
}

export interface PoseKeypoints {
  nose: JointPosition
  leftEye: JointPosition
  rightEye: JointPosition
  leftEar: JointPosition
  rightEar: JointPosition
  leftShoulder: JointPosition
  rightShoulder: JointPosition
  leftElbow: JointPosition
  rightElbow: JointPosition
  leftWrist: JointPosition
  rightWrist: JointPosition
  leftHip: JointPosition
  rightHip: JointPosition
  leftKnee: JointPosition
  rightKnee: JointPosition
  leftAnkle: JointPosition
  rightAnkle: JointPosition
}

export interface ExerciseAnalysis {
  exerciseType: string
  formScore: number // 0-100
  phase: 'preparation' | 'execution' | 'recovery'
  repCount: number
  feedback: FormFeedback[]
  recommendations: string[]
  timestamp: Date
}

export interface FormFeedback {
  type: 'error' | 'warning' | 'success'
  message: string
  bodyPart: string
  severity: 'low' | 'medium' | 'high'
  correction: string
}

export interface ExerciseTemplate {
  name: string
  keyAngles: {
    [jointPair: string]: {
      min: number
      max: number
      optimal: number
    }
  }
  criticalPoints: string[]
  commonMistakes: string[]
  phases: {
    preparation: string[]
    execution: string[]
    recovery: string[]
  }
}

// Exercise templates for form analysis
const EXERCISE_TEMPLATES: { [key: string]: ExerciseTemplate } = {
  squat: {
    name: 'Squat',
    keyAngles: {
      'leftKnee': { min: 70, max: 180, optimal: 90 },
      'rightKnee': { min: 70, max: 180, optimal: 90 },
      'leftHip': { min: 60, max: 180, optimal: 90 },
      'rightHip': { min: 60, max: 180, optimal: 90 }
    },
    criticalPoints: ['knee_alignment', 'back_straight', 'weight_distribution'],
    commonMistakes: [
      'Knees caving inward',
      'Forward lean',
      'Incomplete depth',
      'Weight on toes'
    ],
    phases: {
      preparation: ['feet_shoulder_width', 'core_engaged', 'chest_up'],
      execution: ['controlled_descent', 'knee_tracking', 'depth_achieved'],
      recovery: ['drive_through_heels', 'maintain_posture', 'full_extension']
    }
  },
  pushup: {
    name: 'Push-up',
    keyAngles: {
      'leftElbow': { min: 45, max: 180, optimal: 90 },
      'rightElbow': { min: 45, max: 180, optimal: 90 },
      'spine': { min: 170, max: 180, optimal: 180 }
    },
    criticalPoints: ['plank_position', 'elbow_angle', 'full_range'],
    commonMistakes: [
      'Sagging hips',
      'Flaring elbows',
      'Partial range of motion',
      'Head position'
    ],
    phases: {
      preparation: ['plank_position', 'hand_placement', 'core_tight'],
      execution: ['controlled_descent', 'chest_to_floor', 'elbow_tracking'],
      recovery: ['push_through_palms', 'maintain_line', 'full_extension']
    }
  },
  deadlift: {
    name: 'Deadlift',
    keyAngles: {
      'leftKnee': { min: 160, max: 180, optimal: 170 },
      'rightKnee': { min: 160, max: 180, optimal: 170 },
      'spine': { min: 170, max: 180, optimal: 180 }
    },
    criticalPoints: ['neutral_spine', 'hip_hinge', 'bar_path'],
    commonMistakes: [
      'Rounded back',
      'Bar drift',
      'Knee dominance',
      'Hyperextension'
    ],
    phases: {
      preparation: ['setup_position', 'grip_width', 'shoulder_blades'],
      execution: ['hip_hinge', 'drive_legs', 'maintain_spine'],
      recovery: ['hip_extension', 'shoulder_back', 'controlled_descent']
    }
  }
}

export class ComputerVisionSystem {
  private static instance: ComputerVisionSystem
  private isInitialized = false
  private currentExercise: string | null = null
  private repCount = 0
  private lastPose: PoseKeypoints | null = null
  private analysisHistory: ExerciseAnalysis[] = []

  static getInstance(): ComputerVisionSystem {
    if (!ComputerVisionSystem.instance) {
      ComputerVisionSystem.instance = new ComputerVisionSystem()
    }
    return ComputerVisionSystem.instance
  }

  async initialize(): Promise<boolean> {
    try {
      // In a real implementation, this would initialize MediaPipe or TensorFlow.js
      // For now, we'll simulate the initialization
      console.log('Initializing Computer Vision System...')
      
      // Simulate loading pose detection model
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.isInitialized = true
      console.log('Computer Vision System initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Computer Vision System:', error)
      return false
    }
  }

  setExerciseType(exerciseType: string): boolean {
    if (!EXERCISE_TEMPLATES[exerciseType]) {
      console.error(`Exercise template not found: ${exerciseType}`)
      return false
    }
    
    this.currentExercise = exerciseType
    this.repCount = 0
    this.analysisHistory = []
    console.log(`Exercise type set to: ${exerciseType}`)
    return true
  }

  // Simulate pose detection from video frame
  async detectPose(imageData: ImageData): Promise<PoseKeypoints | null> {
    if (!this.isInitialized) {
      console.error('Computer Vision System not initialized')
      return null
    }

    // In a real implementation, this would use MediaPipe or TensorFlow.js
    // to detect pose keypoints from the image data
    
    // For simulation, we'll generate mock pose data
    const mockPose: PoseKeypoints = this.generateMockPose()
    this.lastPose = mockPose
    
    return mockPose
  }

  analyzeExerciseForm(pose: PoseKeypoints): ExerciseAnalysis | null {
    if (!this.currentExercise || !EXERCISE_TEMPLATES[this.currentExercise]) {
      return null
    }

    const template = EXERCISE_TEMPLATES[this.currentExercise]
    const feedback: FormFeedback[] = []
    const recommendations: string[] = []

    // Analyze key angles
    const angles = this.calculateKeyAngles(pose)
    let formScore = 100

    // Check each key angle against template
    Object.entries(template.keyAngles).forEach(([joint, range]) => {
      const angle = angles[joint]
      if (angle) {
        if (angle < range.min || angle > range.max) {
          formScore -= 15
          feedback.push({
            type: 'error',
            message: `${joint} angle out of range`,
            bodyPart: joint,
            severity: 'high',
            correction: `Adjust ${joint} to be between ${range.min}° and ${range.max}°`
          })
        } else if (Math.abs(angle - range.optimal) > 10) {
          formScore -= 5
          feedback.push({
            type: 'warning',
            message: `${joint} angle could be improved`,
            bodyPart: joint,
            severity: 'medium',
            correction: `Try to maintain ${joint} closer to ${range.optimal}°`
          })
        }
      }
    })

    // Analyze exercise-specific form
    const specificAnalysis = this.analyzeExerciseSpecific(pose, template)
    feedback.push(...specificAnalysis.feedback)
    formScore = Math.max(0, formScore - specificAnalysis.deductions)
    recommendations.push(...specificAnalysis.recommendations)

    // Determine exercise phase
    const phase = this.determineExercisePhase(pose, template)

    // Count reps (simplified logic)
    if (this.shouldCountRep(pose, template)) {
      this.repCount++
    }

    const analysis: ExerciseAnalysis = {
      exerciseType: this.currentExercise,
      formScore: Math.round(formScore),
      phase,
      repCount: this.repCount,
      feedback,
      recommendations,
      timestamp: new Date()
    }

    this.analysisHistory.push(analysis)
    return analysis
  }

  private generateMockPose(): PoseKeypoints {
    // Generate realistic mock pose data for demonstration
    const baseConfidence = 0.8 + Math.random() * 0.2

    return {
      nose: { x: 320, y: 100, confidence: baseConfidence },
      leftEye: { x: 310, y: 90, confidence: baseConfidence },
      rightEye: { x: 330, y: 90, confidence: baseConfidence },
      leftEar: { x: 300, y: 95, confidence: baseConfidence },
      rightEar: { x: 340, y: 95, confidence: baseConfidence },
      leftShoulder: { x: 280, y: 150, confidence: baseConfidence },
      rightShoulder: { x: 360, y: 150, confidence: baseConfidence },
      leftElbow: { x: 250, y: 200 + Math.random() * 50, confidence: baseConfidence },
      rightElbow: { x: 390, y: 200 + Math.random() * 50, confidence: baseConfidence },
      leftWrist: { x: 220, y: 250 + Math.random() * 100, confidence: baseConfidence },
      rightWrist: { x: 420, y: 250 + Math.random() * 100, confidence: baseConfidence },
      leftHip: { x: 290, y: 300, confidence: baseConfidence },
      rightHip: { x: 350, y: 300, confidence: baseConfidence },
      leftKnee: { x: 285, y: 400 + Math.random() * 50, confidence: baseConfidence },
      rightKnee: { x: 355, y: 400 + Math.random() * 50, confidence: baseConfidence },
      leftAnkle: { x: 280, y: 500, confidence: baseConfidence },
      rightAnkle: { x: 360, y: 500, confidence: baseConfidence }
    }
  }

  private calculateKeyAngles(pose: PoseKeypoints): { [key: string]: number } {
    const angles: { [key: string]: number } = {}

    // Calculate knee angles
    angles.leftKnee = this.calculateAngle(
      pose.leftHip, pose.leftKnee, pose.leftAnkle
    )
    angles.rightKnee = this.calculateAngle(
      pose.rightHip, pose.rightKnee, pose.rightAnkle
    )

    // Calculate elbow angles
    angles.leftElbow = this.calculateAngle(
      pose.leftShoulder, pose.leftElbow, pose.leftWrist
    )
    angles.rightElbow = this.calculateAngle(
      pose.rightShoulder, pose.rightElbow, pose.rightWrist
    )

    // Calculate hip angles (simplified)
    angles.leftHip = this.calculateAngle(
      pose.leftShoulder, pose.leftHip, pose.leftKnee
    )
    angles.rightHip = this.calculateAngle(
      pose.rightShoulder, pose.rightHip, pose.rightKnee
    )

    return angles
  }

  private calculateAngle(point1: JointPosition, point2: JointPosition, point3: JointPosition): number {
    const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y }
    const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y }

    const dot = vector1.x * vector2.x + vector1.y * vector2.y
    const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y)
    const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y)

    const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI)
    return isNaN(angle) ? 0 : angle
  }

  private analyzeExerciseSpecific(pose: PoseKeypoints, template: ExerciseTemplate): {
    feedback: FormFeedback[]
    deductions: number
    recommendations: string[]
  } {
    const feedback: FormFeedback[] = []
    let deductions = 0
    const recommendations: string[] = []

    // Exercise-specific analysis based on template
    switch (template.name.toLowerCase()) {
      case 'squat':
        // Check knee alignment
        if (Math.abs(pose.leftKnee.x - pose.leftAnkle.x) > 20) {
          feedback.push({
            type: 'error',
            message: 'Left knee caving inward',
            bodyPart: 'leftKnee',
            severity: 'high',
            correction: 'Keep knees aligned over toes'
          })
          deductions += 20
        }

        // Check depth
        if (pose.leftHip.y < pose.leftKnee.y + 50) {
          feedback.push({
            type: 'warning',
            message: 'Squat depth could be improved',
            bodyPart: 'hips',
            severity: 'medium',
            correction: 'Lower hips below knee level'
          })
          deductions += 10
        }
        break

      case 'push-up':
        // Check plank position
        const shoulderHipAnkle = this.calculateAngle(
          pose.leftShoulder, pose.leftHip, pose.leftAnkle
        )
        if (shoulderHipAnkle < 170) {
          feedback.push({
            type: 'error',
            message: 'Sagging hips detected',
            bodyPart: 'core',
            severity: 'high',
            correction: 'Engage core and maintain straight line'
          })
          deductions += 25
        }
        break

      case 'deadlift':
        // Check spine neutrality (simplified)
        const spineAngle = Math.abs(pose.leftShoulder.y - pose.rightShoulder.y)
        if (spineAngle > 10) {
          feedback.push({
            type: 'error',
            message: 'Uneven shoulders detected',
            bodyPart: 'spine',
            severity: 'high',
            correction: 'Keep shoulders level and spine neutral'
          })
          deductions += 30
        }
        break
    }

    // Add general recommendations
    if (feedback.length === 0) {
      recommendations.push('Great form! Keep it up!')
    } else {
      recommendations.push('Focus on the highlighted corrections')
      recommendations.push('Consider reducing weight if form breaks down')
    }

    return { feedback, deductions, recommendations }
  }

  private determineExercisePhase(pose: PoseKeypoints, template: ExerciseTemplate): 'preparation' | 'execution' | 'recovery' {
    // Simplified phase detection based on movement patterns
    if (!this.lastPose) return 'preparation'

    const movement = Math.abs(pose.leftKnee.y - this.lastPose.leftKnee.y)
    
    if (movement < 5) return 'preparation'
    if (pose.leftKnee.y > this.lastPose.leftKnee.y) return 'execution'
    return 'recovery'
  }

  private shouldCountRep(pose: PoseKeypoints, template: ExerciseTemplate): boolean {
    // Simplified rep counting logic
    // In a real implementation, this would track the full movement cycle
    return Math.random() < 0.1 // Simulate occasional rep detection
  }

  getAnalysisHistory(): ExerciseAnalysis[] {
    return [...this.analysisHistory]
  }

  getAverageFormScore(): number {
    if (this.analysisHistory.length === 0) return 0
    const total = this.analysisHistory.reduce((sum, analysis) => sum + analysis.formScore, 0)
    return Math.round(total / this.analysisHistory.length)
  }

  reset(): void {
    this.currentExercise = null
    this.repCount = 0
    this.lastPose = null
    this.analysisHistory = []
  }

  getSupportedExercises(): string[] {
    return Object.keys(EXERCISE_TEMPLATES)
  }
}

// Export singleton instance
export const computerVisionSystem = ComputerVisionSystem.getInstance()
