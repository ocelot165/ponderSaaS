import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import InfraStack from "../ponderStack";

export function createALB(stack: InfraStack) {
  const albSg = new ec2.SecurityGroup(stack, "SecurityGroupAlb", {
    vpc: stack.vpc,
    allowAllOutbound: true,
  });

  albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

  albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

  const alb = new elbv2.ApplicationLoadBalancer(stack, "Alb", {
    vpc: stack.vpc,
    internetFacing: true,
    deletionProtection: false,
    ipAddressType: elbv2.IpAddressType.IPV4,
    securityGroup: albSg,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  });

  const httplistener = alb.addListener("HttpListener", {
    port: 80,
    open: true,
    defaultAction: elbv2.ListenerAction.fixedResponse(404, {
      messageBody: "404 not found",
    }),
  });

  //   httplistener.addAction("HttpDefaultAction", {
  //     action: elbv2.ListenerAction.redirect({
  //       protocol: "HTTPS",
  //       host: "#{host}",
  //       path: "/#{path}",
  //       query: "#{query}",
  //       port: "80",
  //     }),
  //   });

  stack.alb = alb;
  stack.albSg = albSg;

  const albProps = {
    alb: alb,
    albSg: albSg,
  };

  return albProps;
}
