pipeline{
    agent any
    environment{
        registry = 'public.ecr.aws/y9g3p5r6/onlinebookstoreappdeploy'
    }
    stages{
        stage('Build mvn packages'){
            steps{
                sh 'mvn clean install'

            }
        }
        stage('test packages'){
            steps{
                sh 'mvn test'
            }
        }
         stage('build docker image'){
            steps{
                sh 'docker build -t onlinebookstoreappdeploy:${BUILD_NUMBER} .'
            }
        }
    }
}