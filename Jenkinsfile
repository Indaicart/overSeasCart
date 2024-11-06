pipeline{
    agent {
        label 'docker'
    }
    stages{
        stage("build stage"){
            steps{
                sh "mvn clean install"
            }
        }
        stage("build test"){
            steps{
                sh "mvn test"
            }
        }
        stage("sonarqube"){
            steps{
                sh "mvn clean verify sonar:sonar"
            }
        }
    }
}