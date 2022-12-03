kubectl create namespace logcross

kubectl apply -f https://raw.githubusercontent.com/kube-vip/kube-vip-cloud-provider/main/manifest/kube-vip-cloud-controller.yaml
kubectl apply -f https://kube-vip.io/manifests/rbac.yaml
kubectl apply -f vip.yaml
kubectl apply -f vip-ds.yaml

kubectl create namespace ingress
helm delete default-ingress -n ingress
helm install default-ingress nginx-stable/nginx-ingress -n ingress

sudo ip addr add 192.168.68.221/24 dev enp34s0