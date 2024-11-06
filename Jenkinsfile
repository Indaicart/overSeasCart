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
                withSonarQubeEnv(credentialsId: 'sonar') {
                sh "mvn clean verify sonar:sonar"
                }        
            }
        }
    }
}