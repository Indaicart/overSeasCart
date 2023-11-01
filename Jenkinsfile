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
        stage('login docker'){
            steps{
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'ECR CRED-ACCESSKEY-PRIVATE-KEYS',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretkeyVariable: 'AWS_SECRET_ACCESS_KEY']]) { 
                 sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/y9g3p5r6 .'
                }  
            }
        }
    }
}